exports.bufferHelpHeader = [
    ['{WEditor help:{x'],
    ['The following can be typed on an empty line:'],
    [''],
    ['{W.h{x : help'],
    ['{W.f{x : format the buffer'],
    ['{W.c{x : clears the buffer'],
    ['{W.s{x : show the buffer', '{W.dl{x <line number>        : delete a line'],
    ['{W.q{X : abort and exit', '{W.il{x <line number> <text> : insert a line'],
    ['{W@{x : save and exit', '{W.rl{x <line number> <text> : replace a line']
];

exports.bufferHelpCommand = [
    ['Aside from commands starting with a period, or the \'@\' command, any text that'],
    ['you send will be added to the buffer.'],
    [''],
    ['The following commands are available:'],
    ['.c  : clears the entire buffer'],
    ['.dl : deletes the specified line (for example, "{G.dl 3{x" deletes line number 3)'],
    ['.f  : neatly formats the buffer\'s contents'],
    ['.h  : shows this help message'],
    ['.il : inserts a line (for example, "{G.il 1 This is the new first line.{x")'],
    ['.q  : quits the editor without saving your changes'],
    ['.rl : replaces a line (for example, "{G.rl 1 This replaces line 1.{x")'],
    ['.s  : shows the current contents of the buffer'],
    ['@  : saves your changes and quits the editor'],
    [''],
    ['If you are confused, type .q to abort without changing anything.']
];