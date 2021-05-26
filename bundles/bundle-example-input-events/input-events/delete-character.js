'use strict';

const { EventUtil, Logger } = require('ranvier');

/**
 * Delete character event
 */
module.exports = {
  event: state => (socket, args) => {
    let account = args.account;
    const say = EventUtil.genSay(socket);
    const write = EventUtil.genWrite(socket);

    say("\r\n------------------------------");
    say("|      Delete a Character");
    say("------------------------------");

    const characters = account.characters.filter(currChar => currChar.deleted === false);

    let options = [];
    characters.forEach(char => {
      options.push({
        display: `Delete ${char.username}{x`,
        onSelect: () => {
          write(`Are you sure you want to delete ${char.username}{x?{x {c[Y/n]{x `);
          socket.once('data', confirmation => {
            say('');
            confirmation = confirmation.toString().trim().toLowerCase();

            if (!/[yn]/.test(confirmation)) {
              say('Invalid Option{x');
              return socket.emit('choose-character', socket, args);
            }

            if (confirmation === 'n') {
              say('No one was deleted...');
              return socket.emit('choose-character', socket, args);
            }

            say(`Deleting ${char.username}`);
            account.deleteCharacter(char.username);
            say('Character deleted.');
            return socket.emit('choose-character', socket, args);
          });
        },
      });
    });

    options.push({ display: "" });

    options.push({
      display: 'Go back to main menu',
      onSelect: () => {
        socket.emit('choose-character', socket, args);
      },
    });

    let optionI = 0;
    options.forEach((opt) => {
      if (opt.onSelect) {
        optionI++;
        say(`| {c[${optionI}]{x ${opt.display}`);
      } else {
        say(`| ${opt.display}{x`);
      }
    });

    socket.write('|\r\n`-> ');

    socket.once('data', choice => {
      choice = choice.toString().trim();
      choice = parseInt(choice, 10) - 1;
      if (isNaN(choice)) {
        return socket.emit('choose-character', socket, args);
      }

      const selection = options.filter(o => !!o.onSelect)[choice];

      if (selection) {
        Logger.log('Selected ' + selection.display);
        return selection.onSelect();
      }

      return socket.emit('choose-character', socket, args);
    });
  }
};
