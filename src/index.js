const { UserHandler } = require('./database/UserHandler');

const { MessageHandler } = require('./database/MessageHandler');

//UserHandler.fetchAllUsers();

//UserHandler.createUser('xyz1', 123);

async function sendMessage() {
    const senderid = await UserHandler.getUserId('xyz');
    const receiverid = await UserHandler.getUserId('xyz1');

    //console.log(senderid);

    MessageHandler.createMessage(senderid, receiverid, 'msg2');
}

sendMessage();
