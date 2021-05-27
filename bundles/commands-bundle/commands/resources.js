'use strict';

const { BroadcastSystem: B } = require('ranvier');
const Crafting = require('../../lib/Crafting');
const ItemUtil = require('../../lib/ItemUtil');

module.exports = {
  aliases: [ "materials" ],
  command: state => (args, player) => {
    const playerResources = player.getMeta('resources');

    if (!playerResources) {
      return B.sayAt(player, "You haven't gathered any resources.");
    }

    B.sayAt(player, 'Resources{x');
    B.sayAt(player, B.line(40));
    let totalAmount = 0;
    for (const resourceKey in playerResources) {
      const amount = playerResources[resourceKey];
      totalAmount += amount;

      const resItem = Crafting.getResourceItem(resourceKey);
      B.sayAt(player, `${ItemUtil.display(resItem)} x ${amount}`);
    }

    if (!totalAmount) {
      return B.sayAt(player, "You haven't gathered any resources.");
    }
  }
};
