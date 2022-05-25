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

            let dHandler = await MessageHandler.databaseHandler;
            dHandler.session.startTransaction();

            await messagerecTable
                .insert('sender_user_id', 'receiver_user_id', 'message')
                .values(sender, receiver, message)
                .execute();

            console.log('message recored');

            dHandler.session.commit();
        } catch (err) {
            console.debug(err);
            console.error('failed: message not recorded');

            dHandler.session.rollback();
        }
    }

    static async getConversation(userid1, userid2) {
        let messagerecTable = await MessageHandler.table();

        let conversationCursor = await messagerecTable
            .select('sender_user_id', 'receiver_user_id', 'message', 'timelog')
            .where('sender_user_id in (:userid1, :userid2) or receiver_user_id in (:userid1, :userid2)')
            .orderBy('timelog desc')
            .bind('userid1', userid1)
            .bind('userid2', userid2)
            .execute();

        //console.log(conversationCursor.fetchAll());
        return conversationCursor;
    }
}

module.exports.MessageHandler = MessageHandler;