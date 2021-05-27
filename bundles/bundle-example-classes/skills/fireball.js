'use strict';

const { BroadcastSystem, Damage, SkillType } = require('ranvier');

const damagePercent = 100;
const manaCost = 80;

function getDamage(player) {
  return player.getAttribute('intellect') * (damagePercent / 100);
}

/**
 * Basic mage spell
 */
module.exports = {
  name: 'Fireball',
  type: SkillType.SPELL,
  requiresTarget: true,
  initiatesCombat: true,
  resource: {
    attribute: 'mana',
    cost: manaCost,
  },
  cooldown: 10,

  run: state => function (args, player, target) {
    const damage = new Damage('health', getDamage(player), player, this, {
      type: 'physical',
    });

    BroadcastSystem.sayAt(player, 'With a wave of your hand, you unleash a {rfire{x{yball{x at your target!{x');
    BroadcastSystem.sayAtExcept(player.room, [player, target],`With a wave of their hand, ${player.name} unleashes a {rfire{x{yball{x at ${target.name}!{x`);
    if (!target.isNpc) {
      BroadcastSystem.sayAt(target, `With a wave of their hand, ${player.name} unleashes a {rfire{x{yball{x at you!{x`);
    }
    damage.commit(target);
  },

  info: (player) => {
    return `Hurl a magical fireball at your target dealing ${damagePercent}% of your Intellect as Fire damage.`;
  }
};
