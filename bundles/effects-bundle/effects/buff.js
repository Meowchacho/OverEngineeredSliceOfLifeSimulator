'use strict';

const { BroadcastSystem, EffectFlag } = require('ranvier');

module.exports = {
  config: {
    name: 'Buff Strength',
    description: "You feel stronger!",
    duration: 30 * 1000,
    type: 'buff.strength',
  },
  flags: [EffectFlag.BUFF],
  state: {
    magnitude: 5
  },
  modifiers: {
    attributes: {
      strength: function (current) {
        return current + this.state.magnitude;
      }
    }
  },
  listeners: {
    effectActivated: function () {
      BroadcastSystem.sayAt(this.target, "Strength courses through your veins!");
    },

    effectDeactivated: function () {
      BroadcastSystem.sayAt(this.target, "You feel weaker.");
    }
  }
};
