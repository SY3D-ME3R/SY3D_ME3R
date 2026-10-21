var commands = [];

function mishu(info, func) {
    var data = info;
    data.function = func;
    
    // Si pas de pattern, on utilise cmdname
    if (!data.pattern && data.mishuname) data.pattern = data.mishuname;
    
    if (!data.alias) data.alias = [];
    if (!data.dontAddCommandList) data.dontAddCommandList = false;
    if (!data.desc) data.desc = '';
    if (!data.fromMe) data.fromMe = false;
    if (!data.category) data.category = 'misc';
    
    commands.push(data);
    return data;
}

module.exports = {
    mishu,
    AddCommand: mishu,
    Function: mishu,
    commands,
};

