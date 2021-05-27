'use strict';

const { BroadcastSystem, PlayerRoles } = require('ranvier');
const Parser = require('../../bundle-example-lib/lib/ArgParser');

module.exports = {
  requiredRole: PlayerRoles.ADMIN,
  command: (state) => (args, player) => {
    args = args.trim();

    if (!args.length) {
      return BroadcastSystem.sayAt(player, 'setadmin <player>');
    }

    const target = Parser.parseDot(args, player.room.players);

    if (!target) {
      return BroadcastSystem.sayAt(player, 'They are not here.');
    }

    if (target.role === PlayerRoles.ADMIN) {
      return BroadcastSystem.sayAt(player, 'They are already an administrator.');
    }

    target.role = PlayerRoles.ADMIN;
    BroadcastSystem.sayAt(target, `You have been made an administrator by ${player.name}.`);
    BroadcastSystem.sayAt(player, `${target.name} is now an administrator.`);
  }
};
