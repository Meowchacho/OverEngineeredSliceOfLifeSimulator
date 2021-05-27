'use strict';

const { Config, BroadcastSystem: B } = require('ranvier');
const Combat = require('./lib/Combat');
const CombatErrors = require('./lib/CombatErrors');
const LevelUtil = require('../bundle-example-lib/lib/LevelUtil');
const WebsocketStream = require('../websocket-networking/lib/WebsocketStream');

/**
 * Auto combat module
 */
module.exports = {
  listeners: {
    updateTick: state => function () {
      Combat.startRegeneration(state, this);

      let hadActions = false;
      try {
        hadActions = Combat.updateRound(state, this);
      } catch (e) {
        if (e instanceof CombatErrors.CombatInvalidTargetError) {
          B.sayAt(this, "You can't attack that target.");
        } else {
          throw e;
        }
      }

      if (!hadActions) {
        return;
      }

      const usingWebsockets = this.socket instanceof WebsocketStream;
      // don't show the combat prompt to a websockets server
      if (!this.hasPrompt('combat') && !usingWebsockets) {
        this.addPrompt('combat', _ => promptBuilder(this));
      }

      B.sayAt(this, '');
      if (!usingWebsockets) {
        B.prompt(this);
      }
    },

    /**
     * When the player hits a target
     * @param {Damage} damage
     * @param {Character} target
     */
    hit: state => function (damage, target, finalAmount) {
      if (damage.metadata.hidden) {
        return;
      }

      let buf = '';
      if (damage.source !== this) {
        buf = `Your ${damage.source.name}{x hit`;
      } else {
        buf = "You hit";
      }

      buf += ` ${target.name}{x for ${finalAmount}{x damage.`;

      if (damage.metadata.critical) {
        buf += ' {r(Critical){x';
      }

      B.sayAt(this, buf);

      if (this.equipment.has('wield')) {
        this.equipment.get('wield').emit('hit', damage, target, finalAmount);
      }

      // show damage to party members
      if (!this.party) {
        return;
      }

      for (const member of this.party) {
        if (member === this || member.room !== this.room) {
          continue;
        }

        let buf = '';
        if (damage.source !== this) {
          buf = `${this.name} ${damage.source.name}{x hit`;
        } else {
          buf = `${this.name} hit`;
        }

        buf += ` ${target.name}{x for ${finalAmount}{x damage.`;
        B.sayAt(member, buf);
      }
    },

    /**
     * @param {Heal} heal
     * @param {Character} target
     */
    heal: state => function (heal, target) {
      if (heal.metadata.hidden) {
        return;
      }

      if (target !== this) {
        let buf = '';
        if (heal.source !== this) {
          buf = `Your ${heal.source.name}{x healed`;
        } else {
          buf = "You heal";
        }

        buf += ` ${target.name}{x for {G${finalAmount}{x ${heal.attribute}.`;
        B.sayAt(this, buf);
      }

      // show heals to party members
      if (!this.party) {
        return;
      }

      for (const member of this.party) {
        if (member === this || member.room !== this.room) {
          continue;
        }

        let buf = '';
        if (heal.source !== this) {
          buf = `${this.name} ${heal.source.name}{x healed`;
        } else {
          buf = `${this.name} healed`;
        }

        buf += ` ${target.name}{x`;
        buf += ` for {G${finalAmount}{x ${heal.attribute}.`;
        B.sayAt(member, buf);
      }
    },

    damaged: state => function (damage, finalAmount) {
      if (damage.metadata.hidden || damage.attribute !== 'health') {
        return;
      }

      let buf = '';
      if (damage.attacker) {
        buf = `${damage.attacker.name}{x`;
      }

      if (damage.source !== damage.attacker) {
        buf += (damage.attacker ? "'s " : " ") + `${damage.source.name}{x`;
      } else if (!damage.attacker) {
        buf += "Something";
      }

      buf += ` hit You{x for {R${finalAmount}{x damage.`;

      if (damage.metadata.critical) {
        buf += ' {r(Critical){x';
      }

      B.sayAt(this, buf);

      if (this.party) {
        // show damage to party members
        for (const member of this.party) {
          if (member === this || member.room !== this.room) {
            continue;
          }

          let buf = '';
          if (damage.attacker) {
            buf = `${damage.attacker.name}{x`;
          }

          if (damage.source !== damage.attacker) {
            buf += (damage.attacker ? "'s " : ' ') + `${damage.source.name}{x`;
          } else if (!damage.attacker) {
            buf += "Something";
          }

          buf += ` hit ${this.name}{x for {R${finalAmount}{x damage`;
          B.sayAt(member, buf);
        }
      }

      if (this.getAttribute('health') <= 0) {
        Combat.handleDeath(state, this, damage.attacker);
      }
    },

    healed: state => function (heal, finalAmount) {
      if (heal.metadata.hidden) {
        return;
      }

      let buf = '';
      let attacker = '';
      let source = '';

      if (heal.attacker && heal.attacker !== this) {
        attacker = `${heal.attacker.name}{x `;
      }

      if (heal.source !== heal.attacker) {
        attacker = attacker ? attacker + "'s " : '';
        source = `${heal.source.name}{x`;
      } else if (!heal.attacker) {
        source = "Something";
      }

      if (heal.attribute === 'health') {
        buf = `${attacker}${source} heals you for {R${finalAmount}{x.`;
      } else {
        buf = `${attacker}${source} restores ${finalAmount}{x ${heal.attribute}.`;
      }
      B.sayAt(this, buf);

      // show heal to party members only if it's to health and not restoring a different pool
      if (!this.party || heal.attribute !== 'health') {
        return;
      }

      for (const member of this.party) {
        if (member === this || member.room !== this.room) {
          continue;
        }

        let buf = `${attacker}${source} heals ${this.name} for {R${finalAmount}{x.`;
        B.sayAt(member, buf);
      }
    },

    /**
     * Player was killed
     * @param {Character} killer
     */
     killed: state => {
       const startingRoomRef = Config.get('startingRoom');
       if (!startingRoomRef) {
         Logger.error('No startingRoom defined in ranvier.json');
       }

       return function (killer) {
        this.removePrompt('combat');

        const othersDeathMessage = killer ?
          `{R${this.name} collapses to the ground, dead at the hands of ${killer.name}.{x` :
          `{R${this.name} collapses to the ground, dead{x`;

        B.sayAtExcept(this.room,(killer ? [killer, this] : this), othersDeathMessage);

        if (this.party) {
          B.sayAt(this.party, `{G${this.name} was killed!{x`);
        }

        this.setAttributeToMax('health');

        let home = state.RoomManager.getRoom(this.getMeta('waypoint.home'));
        if (!home) {
          home = state.RoomManager.getRoom(startingRoomRef);
        }

        this.moveTo(home, _ => {
          state.CommandManager.get('look').execute(null, this);

          B.sayAt(this, '{RWhoops, that sucked!{x');
          if (killer && killer !== this) {
            B.sayAt(this, `You were killed by ${killer.name}.`);
          }
          // player loses 20% exp gained this level on death
          const lostExp = Math.floor(this.experience * 0.2);
          this.experience -= lostExp;
          this.save();
          B.sayAt(this, `{rYou lose ${lostExp}{x experience!{x`);

          B.prompt(this);
        });
      };
    },

    /**
     * Player killed a target
     * @param {Character} target
     */
    deathblow: state => function (target, skipParty) {
      const xp = LevelUtil.mobExp(target.level);
      if (this.party && !skipParty) {
        // if they're in a party proxy the deathblow to all members of the party in the same room.
        // this will make sure party members get quest credit trigger anything else listening for deathblow
        for (const member of this.party) {
          if (member.room === this.room) {
            member.emit('deathblow', target, true);
          }
        }
        return;
      }

      if (target && !this.isNpc) {
        B.sayAt(this, `{RYou killed ${target.name}!{x`);
      }

      this.emit('experience', xp);
    }
  }
};

function promptBuilder(promptee) {
  if (!promptee.isInCombat()) {
    return '';
  }

  // Set up some constants for formatting the health bars
  const playerName = "You";
  const targetNameLengths = [...promptee.combatants].map(t => t.name.length);
  const nameWidth = Math.max(playerName.length, ...targetNameLengths);
  const progWidth = 60 - (nameWidth + ':  ').length;

  // Set up helper functions for health-bar-building.
  const getHealthPercentage = entity => Math.floor((entity.getAttribute('health') / entity.getMaxAttribute('health')) * 100);
  const formatProgressBar = (name, progress, entity) => {
    const pad = B.line(nameWidth - name.length, ' ');
    return `${name}${pad}{x: ${progress} ${entity.getAttribute('health')}/${entity.getMaxAttribute('health')}{x`;
  }

  // Build player health bar.
  let currentPerc = getHealthPercentage(promptee);
  let progress = B.progress(progWidth, currentPerc, "{g");
  let buf = formatProgressBar(playerName, progress, promptee);

  // Build and add target health bars.
  for (const target of promptee.combatants) {
    let currentPerc = Math.floor((target.getAttribute('health') / target.getMaxAttribute('health')) * 100);
    let progress = B.progress(progWidth, currentPerc, "{r");
    buf += `\r\n${formatProgressBar(target.name, progress, target)}`;
  }

  return buf;
}
