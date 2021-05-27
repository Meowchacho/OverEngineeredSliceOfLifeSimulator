'use strict';

const { BroadcastSystem, Damage, EffectFlag } = require('ranvier');

/**
 * Implementation effect for a Rend damage over time skill
 */
module.exports = {
  config: {
    name: 'Rend',
    type: 'skill:rend',
    maxStacks: 3,
  },
  flags: [EffectFlag.DEBUFF],
  listeners: {
    effectStackAdded: function (newEffect) {
      // add incoming rend's damage to the existing damage but don't extend duration
      this.state.totalDamage += newEffect.state.totalDamage;
    },

    effectActivated: function () {
      BroadcastSystem.sayAt(this.target, "{RYou've suffered a deep wound, it's bleeding profusely{x");
    },

    effectDeactivated: function () {
      BroadcastSystem.sayAt(this.target, "Your wound has stopped bleeding.");
    },

    updateTick: function () {
      const amount = Math.round(this.state.totalDamage / Math.round((this.config.duration / 1000) / this.config.tickInterval));

      const damage = new Damage("health", amount, this.attacker, this);
      damage.commit(this.target);
    },

    killed: function () {
      this.remove();
    }
  }
};
