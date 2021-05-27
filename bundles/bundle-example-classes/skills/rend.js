'use strict';

const { BroadcastSystem, SkillType } = require('ranvier');
const Combat = require('../../bundle-example-combat/lib/Combat');

// config placed here just for easy copy/paste of this skill later on
const cooldown = 10;
const cost = 50;
const duration = 20 * 1000;
const tickInterval = 3;
const damagePercent = 400;

const totalDamage = player => {
  return Combat.calculateWeaponDamage(player) * (damagePercent / 100);
};


/**
 * DoT (Damage over time) skill
 */
module.exports = {
  name: 'Rend',
  type: SkillType.SKILL,
  requiresTarget: true,
  initiatesCombat: true,
  resource: {
    attribute: 'energy',
    cost,
  },
  cooldown,

  run: state => function (args, player, target) {
    const effect = state.EffectFactory.create(
      'skill.rend',
      {
        duration,
        description: this.info(player),
        tickInterval,
      },
      {
        totalDamage: totalDamage(player),
      }
    );
    effect.skill = this;
    effect.attacker = player;

    effect.on('effectDeactivated', _ => {
      BroadcastSystem.sayAt(player, `{r${target.name}{x stops bleeding.{x`);
    });

    BroadcastSystem.sayAt(player, `{rWith a vicious attack you open a deep wound in ${target.name}{x!{x`);
    BroadcastSystem.sayAtExcept(player.room, [target, player],`{r${player.name} viciously rends ${target.name}.{x`);
    BroadcastSystem.sayAt(target, `{r${player.name} viciously rends you!{x`);
    target.addEffect(effect);
  },

  info: (player) => {
    return `Tear a deep wound in your target's flesh dealing ${damagePercent}%{x weapon damage over ${duration / 1000}{x seconds.`;
  }
};
