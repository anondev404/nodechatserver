const { DatabaseHandler } = require('./DatabaseHandler');
const { MessageHandler } = require('./MessageHandler');
const { databaseConfig } = require('./Config');

class UserHandler {
    _databaseHandler;

    static getHandler() {
        return new UserHandler();
    }

    async _getDatabaseHandler() {
        if (this._databaseHandler) {
            console.log(this._databaseHandler.isConnectionOpen)
            if (this._databaseHandler.isConnectionOpen) {
                return this._databaseHandler;
            }
        }

        //calling handler opens new connection to the database
        this._databaseHandler = await DatabaseHandler.getHandler();

        return this._databaseHandler;
    }

    async _table() {
        //gets USERCRED table from database
        const dHandler = await this._getDatabaseHandler();

        return await dHandler.schema.getTable(databaseConfig.schema.table.usercred);
    }

    async _getUserId(username) {
        const usercredTable = await this._table();

        const useridCursor = await usercredTable
            .select('user_id')
            .where('username = :username')
            .bind('username', username)
            .execute();

        const userid = await useridCursor.fetchOne()[0];

        return userid;
    }

    async createUser(username, password) {
        let usercredTable = await this._table();

        const dHandler = await this._getDatabaseHandler();
        await dHandler.startTransaction();

        try {
            //todo: username, password not parsed
            await usercredTable
                .insert('username', 'password')
                .values(username, password)
                .execute();

            console.log('user created');

            await dHandler.session.commit();
        } catch (err) {
            console.error('failed: user not created');

            await dHandler.session.rollback();
        }

        await this._closeConnection();
    }

    async fetchAllUsers() {
        let usercredTable = await this._table();

        let userCursor = await usercredTable
            .select()
            .execute();

        console.log(userCursor);

        return userCursor;
    }

    async getConverstation(user1, user2) {
        const userid1 = await this._getUserId(user1);
        const userid2 = await this._getUserId(user2);

        await this._closeConnection();

        return MessageHandler.getConversation(userid1, userid2);
    }

    async _closeConnection() {
        const dHandler = await this._getDatabaseHandler();

        await dHandler.close();
    }
}


module.exports.UserHandler = UserHandler;