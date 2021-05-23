'use strict';

const { BroadcastSystem:B } = require('ranvier');
const ItemUtil = require('../../bundle-example-lib/lib/ItemUtil');

module.exports = {
  aliases: ['worn'],
  usage: 'equipment',
  command: (state) => (args, player) => {
    if (!player.equipment.size) {
      return B.sayAt(player, "You are completely naked!");
    }

    B.sayAt(player, "Currently Equipped:");
    for (const [slot, item] of player.equipment) {
      B.sayAt(player, `  <${slot}> ${ItemUtil.display(item)}`);
    }
  }
};
