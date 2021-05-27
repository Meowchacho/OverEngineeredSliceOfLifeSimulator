'use strict';

const { BroadcastSystem} = require('ranvier');
const ArgParser = require('../../bundle-example-lib/lib/ArgParser');

module.exports = {
  command: state => (arg, player) => {
    if (!arg || !arg.length) {
      return BroadcastSystem.sayAt(player, 'Follow whom?');
    }

    let target = ArgParser.parseDot(arg, player.room.players);

    if (!target) {
      if (arg === 'self') {
        target = player;
      } else {
        return BroadcastSystem.sayAt(player, "You can't find anyone named that.");
      }
    }

    // follow self unfollows the person they're currently following
    if (target === player) {
      if (player.following) {
        BroadcastSystem.sayAt(player.following, `${player.name} stops following you.`);
        BroadcastSystem.sayAt(player, `You stop following ${player.following.name}.`);
        player.unfollow();
      } else {
        BroadcastSystem.sayAt(player, "You can't follow yourself...");
      }

      return;
    }

    BroadcastSystem.sayAt(player, `You start following ${target.name}.`);
    BroadcastSystem.sayAt(target, `${player.name} starts following you.`);
    player.follow(target);
  }
};
