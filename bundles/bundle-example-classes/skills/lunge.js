'use strict';

const { Broadcast, Damage, SkillType } = require('ranvier');
const Combat = require('../../bundle-example-combat/lib/Combat');

const damagePercent = 250;
const energyCost = 20;

function getDamage(player) {
  return Combat.calculateWeaponDamage(player) * (damagePercent / 100);
}

/**
 * Basic warrior attack
 */
module.exports = {
  name: 'Lunge',
  type: SkillType.SKILL,
  requiresTarget: true,
  initiatesCombat: true,
  resource: {
    attribute: 'energy',
    cost: energyCost,
  },
  cooldown: 6,

  run: state => function (args, player, target) {
    const damage = new Damage('health', getDamage(player), player, this, {
      type: 'physical',
    });

    Broadcast.sayAt(player, '{rYou shift your feet and let loose a mighty attack!{x');
    Broadcast.sayAtExcept(player.room, `{r${player.name} lets loose a lunging attack on ${target.name}!{x`, [player, target]);
    if (!target.isNpc) {
      Broadcast.sayAt(target, `{r${player.name} lunges at you with a fierce attack!{x`);
    }
    damage.commit(target);
  },

  info: (player) => {
    return `Make a strong attack against your target dealing ${damagePercent}%{x weapon damage.`;
  }
};
