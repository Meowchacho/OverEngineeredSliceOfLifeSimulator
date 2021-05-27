'use strict';

const Ranvier = require('ranvier');
const { BroadcastSystem: B, CommandManager } = require('ranvier');
const Parser = require('../../lib/ArgParser');
const say = B.sayAt;

const subcommands = new CommandManager();
subcommands.add({
  name: 'create',
  command: state => (args, player) => {
    if (player.party) {
      return say(player, "You're already in a group.");
    }

    state.PartyManager.create(player);
    say(player, "{GYou created a group, invite players with '{wgroup invite <name>{x'{x");
  }
});

subcommands.add({
  name: 'invite',
  command: state => (args, player) => {
    if (!player.party) {
      return say(player, "You don't have a group, create one with 'group create{x'.");
    }

    if (player.party && player !== player.party.leader) {
      return say(player, "You aren't the leader of the group.");
    }

    if (!args.length) {
      return say(player, "Invite whom?");
    }

    const target = Parser.parseDot(args, player.room.players);

    if (target === player) {
      return say(player, "You ask yourself if you want to join your own group. You humbly accept.");
    }

    if (!target) {
      return say(player, "They aren't here.");
    }

    if (target.party) {
      return say(player, "They are already in a group.");
    }

    say(target, `{G${player.name} invited you to join their group. Join/decline with '{wgroup join/decline ${player.name}{x'{x`);
    say(player, `{GYou invite ${target.name} to join your group.{x`);
    player.party.invite(target);
    B.prompt(target);
  }
}
);

subcommands.add({
  name: 'disband',
  command: state => (args, player) => {
    if (!player.party) {
      return say(player, "You aren't in a group.");
    }

    if (player !== player.party.leader) {
      return say(player, "You aren't the leader of the group.");
    }

    if (!args || args !== 'sure') {
      return say(player, `{GYou have to confirm disbanding your group with '{wgroup disband sure{x'{x`);
    }

    say(player.party, '{GYour group was disbanded!{x');
    state.PartyManager.disband(player.party);
  }
});

subcommands.add({
  name: 'join',
  command: state => (args, player) => {
    if (!args.length) {
      return say(player, "Join whose group?");
    }

    const target = Parser.parseDot(args, player.room.players);

    if (!target) {
      return say(player, "They aren't here.");
    }

    if (!target.party || target !== target.party.leader) {
      return say(player, "They aren't leading a group.");
    }

    if (!target.party.isInvited(player)) {
      return say(player, "They haven't invited you to join their group.");
    }

    say(player, `{GYou join ${target.name}'s group.{x`);
    say(target.party, `{G${player.name} joined the group.{x`);
    target.party.add(player);
    player.follow(target);
  }
});

subcommands.add({
  name: 'decline',
  command: state => (args, player) => {
    if (!args.length) {
      return say(player, "Decline whose invite?");
    }

    const target = Parser.parseDot(args, player.room.players);

    if (!target) {
      return say(player, "They aren't here.");
    }

    say(player, `{GYou decline to join ${target.name}'s group.{x`);
    say(target, `{G${player.name} declined to join your group.{x`);
    target.party.removeInvite(player);
  }
});

subcommands.add({
  name: 'list',
  command: state => (args, player) => {
    if (!player.party) {
      return say(player, "You're not in a group.");
    }

    say(player, '' + B.center(80, 'Group', 'green', '-') + '{x');
    for (const member of player.party) {
      let tag = '   ';
      if (member === player.party.leader) {
        tag = '[L]';
      }
      say(player, `{G${tag} ${member.name}{x`);
    }
  }
});

subcommands.add({
  name: 'leave',
  command: state => (args, player) => {
    if (!player.party) {
      return say(player, "You're not in a group.");
    }

    if (player === player.party.leader) {
      return say(player, "You have to disband if you want to leave the group.");
    }

    const party = player.party;
    player.party.delete(player);
    say(party, `{G${player.name} left the group.{x`);
    say(player, '{GYou leave the group.{x');
  }
});

module.exports = {
  aliases: [ 'party' ],
  command: state => (args, player) => {

    if (!args || !args.length) {
      args = 'list';
    }

    const [ command, ...commandArgs ] = args.split(' ');
    const subcommand = subcommands.find(command);

    if (!subcommand) {
      return say(player, "Not a valid party command.");
    }

    subcommand.command(state)(commandArgs.join(' '), player);
  }
};
