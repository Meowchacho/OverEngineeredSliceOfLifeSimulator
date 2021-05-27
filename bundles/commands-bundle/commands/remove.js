'use strict';

const { BroadcastSystem:B, ItemType } = require('ranvier');
const ArgParser = require('../../lib/ArgParser');
const ItemUtil = require('../../lib/ItemUtil');

module.exports = {
  aliases: [ 'unwield', 'unequip' ],
  usage: 'remove <item>',
  command : state => (arg, player) => {
    if (!arg.length) {
      return B.sayAt(player, 'Remove what?');
    }

    const result = ArgParser.parseDot(arg, player.equipment, true);
    if (!result) {
      return B.sayAt(player, "You aren't wearing anything like that.");
    }

    const [slot, item] = result;
    B.sayAt(player, `{gYou un-equip: {x${ItemUtil.display(item)}{g.{x`);
    player.unequip(slot);
  }
};
