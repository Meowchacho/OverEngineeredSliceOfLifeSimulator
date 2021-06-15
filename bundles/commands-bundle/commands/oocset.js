'use strict';

const { BroadcastSystem: B } = require('ranvier');
const Tablette = require('../../lib/Tablette');
const Helper = require('../../lib/CommonFunctions');

module.exports = {
  usage: '@set [setting] [value]',
  aliases: ['@set'],
  command: (state) => (args, player) => {
    const possibleSettings = ['line-length'];
    const settingAliases = new Map();
    settingAliases.set('line-length', 'line_length');

    let currLineLength = player.getMeta('config.line_length')

    if (!args.length) {
      const currentConfigs = [
        ['{WSetting{x', `{WValue{x`, '{WDescription of setting{x'],
        [Helper.line(currLineLength, '-')],
        ['line-length', `${currLineLength}`, 'The maximum line length of tables and headers.']
      ];

      B.sayAt(player, Helper.line(currLineLength, '-'));

      let tt = new Tablette();
      tt.readTable(currentConfigs, player.getMeta('config.line_length'));
      let cells = tt.getRange('1:1-1:1');
      cells.forEach((textCell) => {
        textCell.align = textCell.ALIGNS.LEFT;
        textCell.size = Math.round((currLineLength) * 0.2);
      });

      cells = tt.getRange('3:1-10:1');
      cells.forEach((textCell) => {
        textCell.align = textCell.ALIGNS.LEFT;
        textCell.size = Math.round((currLineLength) * 0.2);
      });
      cells = tt.getRange('1:2-10:2');
      cells.forEach((textCell) => {
        textCell.align = textCell.ALIGNS.LEFT;
        textCell.size = Math.round((currLineLength) * 0.1);
      });
      cells = tt.getRange('1:3-10:3');
      cells.forEach((textCell) => {
        textCell.align = textCell.ALIGNS.RIGHT;
        textCell.size = Math.round((currLineLength) * 0.7);
      });
      tt.getPrintableArray().forEach((line) => {
        B.sayAt(player, line);
      });
      return;
    }

    const [configToSet, ...valueToSet] = args.split(' ');

    if (!configToSet) {
      B.sayAt(player, 'Set what?');
      return;
    }

    if (!possibleSettings.includes(configToSet)) {
      B.sayAt(player, `${Helper.capitalize(configToSet)} is not a valid setting.`);
      return;
    }

    if (!valueToSet || valueToSet.length == 0) {
      B.sayAt(player, `Set ${configToSet} to what?`);
      return;
    }

    if (configToSet === 'line-length') {
      let intValue = parseInt(valueToSet);

      if (isNaN(intValue) || intValue < 80 || intValue > 300) { //|| intValue % 2 != 0) {
        B.sayAt(player, `Line length must be between 80 and 300 characters.`);
        return;
      }

      if (!player.getMeta('config')) {
        player.setMeta('config', {});
      }

      player.setMeta(`config.${settingAliases.get(configToSet)}`, intValue);
    }

    B.sayAt(player, `Changed ${configToSet} to ${valueToSet}.`);
  }
};

