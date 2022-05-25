const { UserHandler } = require('./database/UserHandler');
const { MessageHandler } = require('./database/MessageHandler');

const moment = require('moment');

//UserHandler.fetchAllUsers();

//UserHandler.createUser('xyz1', 123);

/*async function sendMessage(sender, receiver, msg) {
    const senderid = await UserHandler.getUserId(sender);
    const receiverid = await UserHandler.getUserId(receiver);

    //console.log(senderid);

    MessageHandler.createMessage(senderid, receiverid, msg);
}

sendMessage('xyz1', 'xyz', 'hello');*/

UserHandler.getHandler().getConverstation('xyz', 'xyz1')
    .then(async (data) => {
        let timeLog1 = (await data.fetchOne())[3];
        console.log(timeLog1);
        let f = moment(timeLog1).format("dddd, MMMM Do YYYY, h:mm:ss a");
        console.log(f);
    });