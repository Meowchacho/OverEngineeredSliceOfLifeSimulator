'use strict';

const sprintf = require('sprintf-js').sprintf;
const LevelUtil = require('../lib/LevelUtil');
const { BroadcastSystem: B, Config, Logger } = require('ranvier');
const Combat = require('../lib/Combat');
const CombatErrors = require('../lib/CombatErrors');
module.exports = {
  listeners: {
    /**
     * Handle a player movement command. From: 'commands' input event.
     * movementCommand is a result of CommandParser.parse
     */
    move: state => function (movementCommand) {
      const { roomExit } = movementCommand;

      if (!roomExit) {
        return B.sayAt(this, "You can't go that way!");
      }

      if (this.isInCombat()) {
        return B.sayAt(this, 'You are in the middle of a fight!');
      }

      const nextRoom = state.RoomManager.getRoom(roomExit.roomId);
      Logger.verbose(nextRoom)
      const oldRoom = this.room;

      const door = oldRoom.getDoor(nextRoom) || nextRoom.getDoor(oldRoom);

      if (door) {
        if (door.locked) {
          return B.sayAt(this, "The door is locked.");
        }

        if (door.closed) {
          return B.sayAt(this, "The door is closed.");
        }
      }

      this.moveTo(nextRoom, _ => {
        state.CommandManager.get('look').execute('', this);
      });

      B.sayAt(oldRoom, `${this.name} leaves.`);
      B.sayAtExcept(nextRoom, this, `${this.name} enters.`);

      for (const follower of this.followers) {
        if (follower.room !== oldRoom) {
          continue;
        }

        if (follower.isNpc) {
          follower.moveTo(nextRoom);
        } else {
          B.sayAt(follower, `\r\nYou follow ${this.name} to ${nextRoom.title}.`);
          follower.emit('move', movementCommand);
        }
      }
    },

    save: state => async function (callback) {
      await state.PlayerManager.save(this);
      if (typeof callback === 'function') {
        callback();
      }
    },

    commandQueued: state => function (commandIndex) {
      const command = this.commandQueue.queue[commandIndex];
      const ttr = sprintf('%.1f', this.commandQueue.getTimeTilRun(commandIndex));
      B.sayAt(this, `{YExecuting{x '{w${command.label}{x' {yin{x {w${ttr}{x {yseconds.{x`);
    },

    updateTick: state => function () {
      if (this.commandQueue.hasPending && this.commandQueue.lagRemaining <= 0) {
        B.sayAt(this);
        this.commandQueue.execute();
        B.prompt(this);
      }
      const lastCommandTime = this._lastCommandTime || Infinity;
      const timeSinceLastCommand = Date.now() - lastCommandTime;
      const maxIdleTime = (Math.abs(Config.get('maxIdleTime')) * 60000) || Infinity;

      if (timeSinceLastCommand > maxIdleTime && !this.isInCombat()) {
        this.save(() => {
          B.sayAt(this, `You were kicked for being idle for more than ${maxIdleTime / 60000} minutes!`);
          B.sayAtExcept(this.room, this, `${this.name} disappears.`);
          Logger.log(`Kicked ${this.name} for being idle.`);
          state.PlayerManager.removePlayer(this, true);
        });
      }
    },

    /**
     * Handle player gaining experience
     * @param {number} amount Exp gained
     */
    experience: state => function (amount) {
      B.sayAt(this, `{bYou gained ${amount}{x experience!{x`);

      const totalTnl = LevelUtil.expToLevel(this.level + 1);

      // level up, currently wraps experience if they gain more than needed for multiple levels
      if (this.experience + amount > totalTnl) {
        B.sayAt(this, '                                   {B!Level Up!{x');
        B.sayAt(this, B.progress(80, 100, "{b"));

        let nextTnl = totalTnl;
        while (this.experience + amount > nextTnl) {
          amount = (this.experience + amount) - nextTnl;
          this.level++;
          this.experience = 0;
          nextTnl = LevelUtil.expToLevel(this.level + 1);
          B.sayAt(this, `{bYou are now level ${this.level}!{x`);
          this.emit('level');
        }
      }

      this.experience += amount;

      this.save();
    },
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

      const usingWebsockets = false;
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
    },

    questStart: state => function (quest) {
      B.sayAt(this, `\r\n{YQuest Started: ${quest.config.title}!{x`);
      if (quest.config.description) {
        B.sayAt(this, B.line(80));
        B.sayAt(this, `{Y${quest.config.description}{x`, 80);
      }

      if (quest.config.rewards.length) {
        B.sayAt(this);
        B.sayAt(this, '{Y' + B.center(80, 'Rewards') + '{x');
        B.sayAt(this, '{Y' + B.center(80, '-------') + '{x');

        for (const reward of quest.config.rewards) {
          const rewardClass = state.QuestRewardManager.get(reward.type);
          B.sayAt(this, '  ' + rewardClass.display(state, quest, reward.config, this));
        }
      }

      B.sayAt(this, B.line(80));
    },

    questProgress: state => function (quest, progress) {
      B.sayAt(this, `\r\n{Y${progress.display}{x`);
    },

    questTurnInReady: state => function (quest) {
      B.sayAt(this, `{Y${quest.config.title} ready to turn in!{x`);
    },

    questComplete: state => function (quest) {
      B.sayAt(this, `{YQuest Complete: ${quest.config.title}!{x`);

      if (quest.config.completionMessage) {
        B.sayAt(this, B.line(80));
        B.sayAt(this, quest.config.completionMessage);
      }
    },

    /**
     * Player received a quest reward
     * @param {object} reward Reward config _not_ an instance of QuestReward
     */
    questReward: state => function (reward) {
      // do stuff when the player receives a quest reward. Generally the Reward instance
      // will emit an event that will be handled elsewhere and display its own message
      // e.g., 'currency' or 'experience'. But if you want to handle that all in one
      // place instead, or you'd like to show some supplemental message you can do that here
    },
    
    /**
     * Handle a player equipping an item with a `stats` property
     * @param {string} slot
     * @param {Item} item
     */
     equip: state => function (slot, item) {
      if (!item.metadata.stats) {
        return;
      }

      const config = {
        name: 'Equip: ' + slot,
        type: 'equip.' + slot
      };

      const effectState = {
        slot,
        stats: item.metadata.stats,
      };

      this.addEffect(state.EffectFactory.create(
        'equip',
        config,
        effectState
      ));
    },
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

