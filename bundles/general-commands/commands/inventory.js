'use strict';

const { BroadcastSystem:B } = require('ranvier');
const ItemUtil = require('../../bundle-example-lib/lib/ItemUtil');

module.exports = {
  usage: 'inventory',
  command : (state) => (args, player) => {
    if (!player.inventory || !player.inventory.size) {
      return B.sayAt(player, "You aren't carrying anything.");
    }

    B.at(player, "You are carrying");
    if (isFinite(player.inventory.getMax())) {
      B.at(player, ` (${player.inventory.size}/${player.inventory.getMax()})`);
    }
    B.sayAt(player, ':');

    // TODO: Implement grouping
    for (const [, item ] of player.inventory) {
      B.sayAt(player, ItemUtil.display(item));
    }
  }
};
