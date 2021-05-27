'use strict';

const { BroadcastSystem, SkillType } = require('ranvier');

// config placed here just for easy configuration of this skill later on
const cooldown = 45;
const cost = 50;
const healthPercent = 15;
const duration = 20 * 1000;

/**
 * Damage mitigation skill
 */
module.exports = {
  name: 'Shield Block',
  type: SkillType.SKILL,
  requiresTarget: false,
  resource: {
    attribute: 'energy',
    cost,
  },
  cooldown,

  run: state => function (args, player, target) {
    if (!player.equipment.has('shield')) {
      BroadcastSystem.sayAt(player, "You aren't wearing a shield!");
      return false;
    }

    const effect = state.EffectFactory.create(
      'skill.shieldblock',
      {
        duration,
        description: this.info(player),
      },
      {
        magnitude: Math.round(player.getMaxAttribute('health') * (healthPercent / 100))
      }
    );
    effect.skill = this;

    BroadcastSystem.sayAt(player, `You raise your shield, bracing for incoming attacks!{x`);
    BroadcastSystem.sayAtExcept(player.room, [player],`${player.name} raises their shield, bracing for incoming damage.{x`);
    player.addEffect(effect);
  },

  info: (player) => {
    return `Raise your shield block damage up to ${healthPercent}%{x of your maximum health for ${duration / 1000}{x seconds. Requires a shield.`;
  }
};
