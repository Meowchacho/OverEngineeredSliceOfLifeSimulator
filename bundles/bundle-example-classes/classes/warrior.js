'use strict';

/**
 * This example definition of a class file is a guideline. The class system is
 * left intentionally vague so as to not be too opinionated. Class files are
 * assumed to be js files instead of blank yaml files just to future proof the
 * bundle-loading of class files in case someone wants extra functionality in
 * their classes.
 */
module.exports = {
  name: 'Warrior',
  description: 'Warriors relish being face-to-face with their enemy. Whether it be wielding axes, maces, swords, or a nearby log, Warriors focus on dealing strong physical damage to their opponent. What they lack in the raw magical damage of a Mage, or the healing prowess of a Cleric, Warriors make up for in their tenacity. Those choosing the more defensive path of the shield can outlast otherwise deadly attacks.',

  abilityTable: {
    3: { skills: ['rend'] },
    5: { skills: ['lunge'] },
    7: { skills: ['shieldblock'] },
   10: { skills: ['secondwind'] },
  },

  setupPlayer: (state, player) => {
    const energy = state.AttributeFactory.create('energy', 100);
    player.addAttribute(energy);
    player.prompt = '[ %health.current%/%health.max% hp{x %energy.current%/%energy.max% energy{x ]';
  }
};
