'use strict';

const {
  AreaAudience,
  PartyAudience,
  PrivateAudience,
  RoomAudience,
  WorldAudience,
} = require('ranvier');

const { Channel } = require('ranvier').Channel;

module.exports = [
  new Channel({
    name: 'chat',
    aliases: ['.'],
    prefixColor: ['bold', 'white'],
    messageColor: 'cyan',
    suffix: '',
    description: 'Chat with everyone on the game',
    audience: new WorldAudience()
  }),

  new Channel({
    name: 'say',
    prefixColor: ['bold', 'green'],
    messageColor: 'green',
    description: 'Send a message to all players in your room',
    audience: new RoomAudience(),
    prefixToSource: '`You say \'`',
    prefixToOthers: '`${sender.name} says \'`',
    suffix: '`\'`'
  }),

  new Channel({
    name: 'tell',
    prefixColor: ['bold', 'white'],
    messageColor: 'white',
    description: 'Send a private message to another player',
    prefixToSource: '`You tell ${this.audience.getBroadcastTargets()[0].name} \'`',
    prefixToTarget:'`${sender.name} tells you, \'`',
    suffix: '`\'`',
    audience: new PrivateAudience(),
  }),

  new Channel({
    name: 'yell',
    color: ['bold', 'red'],
    description: 'Send a message to everyone in your area',
    audience: new AreaAudience(),
    
  }),

  new Channel({
    name: 'gtell',
    color: ['bold', 'green'],
    description: 'Send a message to everyone in your group, anywhere in the game',
    audience: new PartyAudience(),
  }),
];
