'use strict';

const { Broadcast, Damage, SkillType } = require('ranvier');

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

    Broadcast.sayAt(player, 'With a wave of your hand, you unleash a {rfire{x{yball{x at your target!{x');
    Broadcast.sayAtExcept(player.room, `With a wave of their hand, ${player.name} unleashes a {rfire{x{yball{x at ${target.name}!{x`, [player, target]);
    if (!target.isNpc) {
      Broadcast.sayAt(target, `With a wave of their hand, ${player.name} unleashes a {rfire{x{yball{x at you!{x`);
    }
    damage.commit(target);
  },

  info: (player) => {
    return `Hurl a magical fireball at your target dealing ${damagePercent}% of your Intellect as Fire damage.`;
  }
};
