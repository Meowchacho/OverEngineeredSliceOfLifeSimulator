'use strict';

const { BroadcastSystem, EffectFlag, Heal } = require('ranvier');

/**
 * Effect applied by Judge skill. Reduces damage done.
 */
module.exports = {
  config: {
    name: 'Judged',
    description: 'Damage of your next attack is reduced.',
    type: 'skill:judge',
  },
  flags: [EffectFlag.DEBUFF],
  state: {
    reductionPercent: 0
  },
  modifiers: {
    incomingDamage: (damage, current) => current,
    outgoingDamage: function (damage, currentAmount) {
      if (damage instanceof Heal || damage.attribute !== 'health') {
        return currentAmount;
      }

      const reduction = Math.round(currentAmount * (this.state.reductionPercent / 100));
      return currentAmount - reduction;
    },
  },
  listeners: {
    effectActivated: function () {
      BroadcastSystem.sayAt(this.target, '{yThe holy judgement weakens you.{x');
    },

    effectDeactivated: function () {
      BroadcastSystem.sayAt(this.target, '{yYou feel your strength return.{x');
    },

    hit: function () {
      this.remove();
    }
  }
};
