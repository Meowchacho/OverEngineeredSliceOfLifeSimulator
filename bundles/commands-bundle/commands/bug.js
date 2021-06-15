'use strict';
const { BroadcastSystem: B, CommandManager, Note } = require('ranvier');
const Ranvier = require('ranvier');
const Helper = require('../../lib/CommonFunctions')

module.exports = {
  usage: 'bug <list / write / edit # / read #>',
  aliases: ['bugs', 'sysbug'],
  command: state => (args, player, arg0, extraArgs) => {

    if (extraArgs && extraArgs.subCmd) {
      args = extraArgs.subCmd + ' ' + args;
    }

    if (!args || !args.length) {
      return B.sayAt(player, 'Do what with bugs?\n\rValid commands are:  write <subject>, read <number>, edit <number>, or remove <number>.');
    }

    const [command, ...commandArgs] = args.split(' ');
    const subcommand = subcommands.find(command);

    if (!subcommand) {
      return B.sayAt(player, 'Not a valid bug command.\n\rValid commands are:  write <subject>, read <number>, edit <number>, or remove <number>.');
    }

    return subcommand.command(state)(commandArgs.join(' '), player, arg0, extraArgs);
  }
};

const subcommands = new CommandManager();

subcommands.add({
  name: 'list',
  command: state => (args, player) => {
    B.sayAt(player, 'The following bugs have been submitted: ');

    let board = state.BoardManager.getBoard('Bugs');
    Helper.printNoteList(board, player);
  }
});

subcommands.add({
  name: 'read',
  command: state => (args, player) => {
    if (!args || !args.length) {
      B.sayAt(player, 'Read which bug?');
      return;
    }
    let number = parseInt(args)
    let board = state.BoardManager.getBoard('Bugs');
    let note = board.getNote(number, player);

    if (!note) {
      B.sayAt(player, 'No bug with that number was found, or may not be visible to you.');
      return;
    }

    B.sayAt(player, Helper.line(80, '='));
    B.sayAt(player, `From: ${note.from.padEnd(42, ' ')}Date: ${Helper.getLongDateString(note.dateWritten).padStart(26, ' ')}`);
    B.sayAt(player, `Subject: ${note.subject}`);
    B.sayAt(player, `To: ${note.to}`);
    B.sayAt(player, Helper.line(80, '='));
    note.body.forEach((element) => { B.sayAt(player, element); });
  }
});

subcommands.add({
  name: 'remove',
  command: state => (args, player) => {
    if (!args || !args.length) {
      B.sayAt(player, 'Remove which bug?');
      return;
    }
    let number = parseInt(args)
    let board = state.BoardManager.getBoard('Bugs');
    let note = board.getNote(number, player);

    if (!note) {
      B.sayAt(player, 'No bug with that number was found, or may not be visible to you.');
      return;
    }

    if (board.doRemoveNote(number, player)) {
      B.sayAt(player, `Bug number ${number} removed.`);
    }
    else {
      B.sayAt(player, "You are unable to remove that bug. Please ask an Admin.")
    }
  }
});

subcommands.add({
  name: 'write',
  command: state => (args, player, arg0, extraArgs) => {

    if (!extraArgs) {
      if (!args || args.length <= 0) {
        B.sayAt(player, "Write an bug about what subject?");
        return;
      }
      else if (args && args.length > 100) {
        B.sayAt(player, "An bug's subject should be less than or equal to 100 characters long.")
        return;
      }

      let tempNote = new Note();
      tempNote.board = 'Bugs';
      tempNote.to = 'all';
      tempNote.from = player.name;
      tempNote.number = state.BoardManager.getBoard('Bugs').getNextNoteNumber();
      tempNote.subject = args;
      player.tempBugNote = tempNote;
      extraArgs = { 'typeOfBuffer': 'bug', 'state': 'starting' };
      args = 'write';
    }

    let result = Helper.editorLambda(args, player, arg0, extraArgs);

    if (result && result.state === 'finishing') {
      let noteToSend = player.tempBugNote;
      player.tempBugNote = null;
      noteToSend.body = extraArgs.accumulator;
      noteToSend.dateWritten = new Date();

      state.BoardManager.getBoard('Bugs').addNote(noteToSend);

      B.sayAt(player, "Your bug has been shared, thank you for contributing!");
      return;
    }
    return result;
  }
});

subcommands.add({
  name: 'edit',
  command: state => (args, player, arg0, extraArgs) => {
    if (!extraArgs) {
      if (!args || !args.length) {
        B.sayAt(player, 'Edit which bug?');
        return;
      }
      let number = parseInt(args)
      let board = state.BoardManager.getBoard('Bugs');
      let note = board.getNote(number, player);

      if (!note) {
        B.sayAt(player, 'No bug with that number was found, or may not be visible to you.');
        return;
      }

      if (!board.canEditNote(number, player)) {
        B.sayAt(player, 'You are not the author of that bug.');
        return;
      }

      player.tempBugNote = note;
      extraArgs = { 'typeOfBuffer': 'bug', 'state': 'starting', 'accumulator': note.body };
      args = 'edit';
    }

    let result = Helper.editorLambda(args, player, arg0, extraArgs);

    if (result && result.state === 'finishing') {
      B.sayAt(player, "Your bug has been edited, thank you for contributing!");
      let noteToSend = player.tempBugNote;
      player.tempBugNote = null;

      noteToSend.body = extraArgs.accumulator;
      state.BoardManager.getBoard('Bugs').addNote(noteToSend);
      return;
    }
    return result;

  }
});