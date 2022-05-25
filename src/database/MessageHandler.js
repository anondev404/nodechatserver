const { DatabaseHandler } = require('./DatabaseHandler');
const { databaseConfig } = require('./Config');

class MessageHandler {
    static get databaseHandler() { return DatabaseHandler.getHandler(); }

    static async table() {
        //gets MESSAGEREC table from database
        let dHandler = await MessageHandler.databaseHandler;
        return await dHandler.schema.getTable(databaseConfig.schema.table.messagerec);
    }

    static async createMessage(sender, receiver, message) {
        let messagerecTable = await MessageHandler.table();

        try {
            //todo: username, password not parsed
            await messagerecTable
                .insert('sender_user_id', 'receiver_user_id', 'message')
                .values(sender, receiver, message)
                .execute();

            console.log('message recored');

        } catch (err) {
            console.debug(err);
            console.error('failed: message not recorded');
        }
    }
}

module.exports.MessageHandler = MessageHandler;