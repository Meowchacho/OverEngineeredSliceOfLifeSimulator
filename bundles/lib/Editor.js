const { BroadcastSystem: B, Logger, EventUtil } = require('ranvier');
const Helper = require('./CommonFunctions');
exports.enterEditor = (player,data) =>{
    const {type, loggerName, callback, existingBuffer} = data;
    B.sayAt(player, `You are entering the ${data.type} editor.`);
    B.sayAtExcept(player.room, player, `${player.name} enters the ${data.type} editor.`);
    Helper.printInitialBufferHelp(data.type, player);

    player.otherInput = true;
    player.editor = { type, existingBuffer, callback};
    player.tempPrompt = player.prompt;
    player.prompt = '> ';
    B.prompt(player);

    Logger.verbose(`[ (Editor-${type}): ${player.name} has entered '${loggerName}'. ]`);

    return player.socket.emit('editor', player, data);
}