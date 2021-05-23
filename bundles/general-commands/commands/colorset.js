'use strict';

const { BroadcastSystem: B } = require('ranvier');

/**
 * Set the color of various messages
 */
module.exports = {
    usage: 'colorset',
    command: (state) => (args, player) => {
        if (!args.length) {
            B.sayAt(player, 'Set the color for what?');
            return state.CommandManager.get('help').execute('colorset', player);
        }

        let [messageToSet, part, color, colorTwo] = args.split(' ');
        color = `${color}${colorTwo?' ' + colorTwo:''}`;

        if (!messageToSet) {
            B.sayAt(player, 'Set what?');
            return state.CommandManager.get('help').execute('colorset', player);
        }

        if (!part) {
            B.sayAt(player, `Set ${messageToSet}'s <bold>prefix</bold> or <bold>message</bold> body color?`);
            return state.CommandManager.get('help').execute('colorset', player);
        }

        if (!color) {
            B.sayAt(player, `Set ${messageToSet}'s ${part} to what color?`);
            return state.CommandManager.get('help').execute('colorset', player);
        }

        color = color.split(' ')
        if (color == "default") {
            color = null;
        }
        player.setChannelColor(messageToSet, part, color);
        player.save(() => {
            B.sayAt(player, "Color preference saved.");
        });
    }
};