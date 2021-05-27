'use strict';

const { BroadcastSystem} = require('ranvier');
const ArgParser = require('../../lib/ArgParser');

module.exports = {
  command: state => (arg, player) => {
    if (!arg || !arg.length) {
      return BroadcastSystem.sayAt(player, 'Ditch whom?');
    }

    let target = ArgParser.parseDot(arg, player.followers);

    if (!target) {
      return BroadcastSystem.sayAt(player, "They aren't following you.");
    }

    BroadcastSystem.sayAt(player, `You ditch ${target.name} and they stop following you.`);
    BroadcastSystem.sayAt(target, `${player.name} ditches you and you stop following them.`);
    target.unfollow();
  }
};
