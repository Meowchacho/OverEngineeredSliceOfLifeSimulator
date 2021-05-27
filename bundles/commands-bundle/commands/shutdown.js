'use strict';

const { BroadcastSystem, PlayerRoles } = require('ranvier');

/**
 * Shut down the MUD from within the game.
 */
module.exports = {
  requiredRole: PlayerRoles.ADMIN,
  command: state => (time, player) => {

    if (time === 'reboot') {
      BroadcastSystem.sayAt(state.PlayerManager, '{RGame is totally rebooting{x');
      return;
    }
    if (time === 'now') {
      BroadcastSystem.sayAt(state.PlayerManager, '{YGame is shutting down now!{x');
      process.exit();
      return;
    }

    if (!time.length || time !== 'sure') {
      return BroadcastSystem.sayAt(player, 'You must confirm the shutdown with "shutdown sure" or force immediate shutdown with "shutdown now"');
    }

    BroadcastSystem.sayAt(state.PlayerManager, `{YGame will shut down in ${30} seconds.{x`);
    setTimeout(async _ => {
      BroadcastSystem.sayAt(state.PlayerManager, '{YGame is shutting down now!{x');
      state.PlayerManager.saveAll();
      process.exit();
    }, 30000);
  }
};
