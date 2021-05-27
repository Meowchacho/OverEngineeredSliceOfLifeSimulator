'use strict';

const { BroadcastSystem, EffectFlag, Heal } = require('ranvier');

/**
 * Implementation effect for second wind skill
 */
module.exports = {
  config: {
    name: 'Second Wind',
    type: 'skill:secondwind'
  },
  flags: [EffectFlag.BUFF],
  listeners: {
    damaged: function (damage) {
      if (damage.attribute !== 'energy') {
        return;
      }

      if (this.skill.onCooldown(this.target)) {
        return;
      }

      if ((this.target.getAttribute('energy') / this.target.getMaxAttribute('energy')) * 100 > this.state.threshold) {
        return;
      }

      BroadcastSystem.sayAt(this.target, "{YYou catch a second wind!{x");
      const amount = Math.floor(this.target.getMaxAttribute('energy') * (this.state.restorePercent / 100));
      const heal = new Heal('energy', amount, this.target, this.skill);
      heal.commit(this.target);

      this.skill.cooldown(this.target);
    }
  }
};
