'use strict';

const { BroadcastSystem: B } = require('ranvier');

module.exports = {
  usage: 'config <set/list> [setting] [value]',
  aliases: ['toggle', 'options', 'set'],
  command: (state) => (args, player) => {
    if (!args.length) {
      B.sayAt(player, 'Configure what?');
      return state.CommandManager.get('help').execute('config', player);
    }

    const possibleCommands = ['set', 'list'];

    const [command, configToSet, valueToSet ] = args.split(' ');

    if (!possibleCommands.includes(command)) {
      B.sayAt(player, `{rInvalid config command: ${command}{x`);
      return state.CommandManager.get('help').execute('config', player);
    }

    if (command === 'list') {
      B.sayAt(player, 'Current Settings:');
      for (const key in player.metadata.config) {
        const val = player.metadata.config[key] ? 'on' : 'off';
        B.sayAt(player, `  ${key}: ${val}`);
      }
      return;
    }

    if (!configToSet) {
      B.sayAt(player, 'Set what?');
      return state.CommandManager.get('help').execute('config', player);
    }

    const possibleSettings = ['brief', 'autoloot', 'minimap'];

    if (!possibleSettings.includes(configToSet)) {
      B.sayAt(player, `{rInvalid setting: ${configToSet}. Possible settings: ${possibleSettings.join(', ')}`);
      return state.CommandManager.get('help').execute('config', player);
    }

    if (!valueToSet) {
      B.sayAt(player, `{rWhat value do you want to set for ${configToSet}?{x`);
      return state.CommandManager.get('help').execute('config', player);
    }

    const possibleValues = {
      on: true,
      off: false
    };

    if (possibleValues[valueToSet] === undefined) {
      return B.sayAt(player, `{rValue must be either: on / off{x`);
    }

    if (!player.getMeta('config')) {
      player.setMeta('config', {});
    }

    player.setMeta(`config.${configToSet}`, possibleValues[valueToSet]);

    B.sayAt(player, 'Configuration value saved');
  }
};

