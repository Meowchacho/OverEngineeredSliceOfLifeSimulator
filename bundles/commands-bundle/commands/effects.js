'use strict';

const humanize = (sec) => { return require('humanize-duration')(sec, { round: true }); };
const { BroadcastSystem: B, EffectFlag } = require('ranvier');

module.exports = {
  aliases: [ "affects" ],
  command : (state) => (args, player) => {
    B.sayAt(player, "Current Effects:");

    const effects = player.effects.entries().filter(effect => {
      return !effect.config.hidden;
    });

    if (!effects.length) {
      return B.sayAt(player, "  None.");
    }

    for (const effect of effects) {
      let color = 'white';
      if (effect.flags.includes(EffectFlag.BUFF)) {
        color = 'green';
      } else if (effect.flags.includes(EffectFlag.DEBUFF)) {
        color = 'red';
      }
      B.at(player, `<${color}>  ${effect.name}</${color}>{x`);
      if (effect.config.maxStacks) {
        B.at(player, ` (${effect.state.stacks || 1})`);
      }

      B.at(player, ':');

      if (effect.duration === Infinity) {
        B.sayAt(player, "Permanent");
      } else {
        B.sayAt(player, ` ${humanize(effect.remaining)} remaining`);
      }
      B.sayAt(player, "\t" + effect.description);
    }
  }
};
