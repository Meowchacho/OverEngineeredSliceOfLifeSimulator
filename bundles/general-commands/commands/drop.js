'use strict';

const { BroadcastSystem:B } = require('ranvier');
const ArgParser = require('../../bundle-example-lib/lib/ArgParser');
const ItemUtil = require('../../bundle-example-lib/lib/ItemUtil');

module.exports = {
  usage: 'drop <item>',
  command : (state) => (args, player) => {
    args = args.trim();

    if (!args.length) {
      return B.sayAt(player, 'Drop what?');
    }

    if (!player.room) {
      return B.sayAt(player, 'You are floating in the nether, it would disappear forever.');
    }

    const item = ArgParser.parseDot(args, player.inventory);

    if (!item) {
      return B.sayAt(player, "You aren't carrying anything like that.");
    }

    player.removeItem(item);
    player.room.addItem(item);
    player.emit('drop', item);
    item.emit('drop', player);

    for (const npc of player.room.npcs) {
      npc.emit('playerDropItem', player, item);
    }

    B.sayAt(player, `{gYou dropped: {x${ItemUtil.display(item)}{g.{x`);
  }
};
