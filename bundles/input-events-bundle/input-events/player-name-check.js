'use strict';

const { EventUtil } = require('ranvier');

/**
 * Confirm new player name
 */
module.exports = {
  event: state => (socket, args) => {
    const say = EventUtil.genSay(socket);
    const write  = EventUtil.genWrite(socket);

    write(`{W${args.name} doesn't exist, would you like to create it?{x {c[y/n]{x `);
    socket.once('data', confirmation => {
      say('');
      confirmation = confirmation.toString().trim().toLowerCase();

      if (!/[yn]/.test(confirmation)) {
        return socket.emit('player-name-check', socket, args);
      }

      if (confirmation === 'n') {
        say(`Let's try again...`);
        return socket.emit('create-player', socket, args);
      }

      socket.emit('finish-player', socket, args);
    });
  }
};
