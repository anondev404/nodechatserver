const { DatabaseHandler } = require('./DatabaseHandler');
const { databaseConfig } = require('./Config');

class MessageHandler {
    _databaseHandler;

    static getHandler() {
        return new MessageHandler();
    }

    async _getDatabaseHandler() {
        if (this._databaseHandler) {

            console.log(this._databaseHandler.isConnectionOpen);

            if (this._databaseHandler.isConnectionOpen) {
                return this._databaseHandler;
            }
        }

        //calling handler opens new connection to the database
        this._databaseHandler = await DatabaseHandler.getHandler();

        return this._databaseHandler;
    }

    async table() {
        let dHandler = await this._getDatabaseHandler();

        //gets MESSAGEREC table from database
        return await dHandler.schema.getTable(databaseConfig.schema.table.messagerec);
    }

    async createMessage(sender, receiver, message) {
        let messagerecTable = await this.table();

        let dHandler = await this._getDatabaseHandler();
        await dHandler.session.startTransaction();

        try {
            //todo: sender, receiver, message not parsed
            await messagerecTable
                .insert('sender_user_id', 'receiver_user_id', 'message')
                .values(sender, receiver, message)
                .execute();

            console.log('message recorded');

            await dHandler.session.commit();
        } catch (err) {
            console.debug(err);
            console.error('failed: message not recorded');

            await dHandler.session.rollback();
        }

        await this._closeConnection();
    }

    async getConversation(userid1, userid2) {
        let messagerecTable = await this.table();

        let conversationCursor = await messagerecTable
            .select('sender_user_id', 'receiver_user_id', 'message', 'timelog')
            .where('sender_user_id in (:userid1, :userid2) or receiver_user_id in (:userid1, :userid2)')
            .orderBy('timelog desc')
            .bind('userid1', userid1)
            .bind('userid2', userid2)
            .execute();

        await this._closeConnection();

        return conversationCursor;
    }

    _resetDatabaseHandler() {
        this._databaseHandler = null;
    }

    async _closeConnection() {
        if (this._databaseHandler) {
            await this._databaseHandler.close();
            this._resetDatabaseHandler();
            console.log('closing connection msgh')
        }
    }
}

module.exports.MessageHandler = MessageHandler;