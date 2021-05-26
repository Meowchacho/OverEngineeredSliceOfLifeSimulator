'use strict';

const { Broadcast: B, Heal, SkillType } = require('ranvier');

const healPercent = 300;
const energyCost = 40;

function getHeal(player) {
  return player.getAttribute('intellect') * (healPercent / 100);
}

/**
 * Basic cleric spell
 */
module.exports = {
  name: 'Heal',
  type: SkillType.SPELL,
  requiresTarget: true,
  initiatesCombat: false,
  targetSelf: true,
  resource: {
    attribute: 'energy',
    cost: energyCost,
  },
  cooldown: 10,

  run: state => function (args, player, target) {
    const heal = new Heal('health', getHeal(player), player, this);

    if (target !== player) {
      B.sayAt(player, `You call upon to the light to heal ${target.name}'s wounds.{x`);
      B.sayAtExcept(player.room, `${player.name} calls upon to the light to heal ${target.name}'s wounds.{x`, [target, player]);
      B.sayAt(target, `${player.name} calls upon to the light to heal your wounds.{x`);
    } else {
      B.sayAt(player, "You call upon to the light to heal your wounds.{x");
      B.sayAtExcept(player.room, `${player.name} calls upon to the light to heal their wounds.{x`, [player, target]);
    }

    heal.commit(target);
  },

  info: (player) => {
    return `Call upon the light to heal your target's wounds for ${healPercent}% of your Intellect.`;
  }
};
