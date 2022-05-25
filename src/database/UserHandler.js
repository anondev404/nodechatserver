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

            console.log(this._databaseHandler.isConnectionOpen);

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
        } finally {
            await this._closeConnection();
        }

    }

    async fetchAllUsers() {
        let usercredTable = await this._table();

        let userCursor = await usercredTable
            .select()
            .execute();

        console.log(userCursor);

        await this._closeConnection();

        return userCursor;
    }

    async getConverstation(user1, user2) {
        const userid1 = await this._getUserId(user1);
        const userid2 = await this._getUserId(user2);


        await this._closeConnection();

        let msgHanlder = MessageHandler.getHandler();

        return await msgHanlder.getConversation(userid1, userid2);
    }

    _resetDatabaseHandler() {
        this._databaseHandler = null;
    }

    async _closeConnection() {
        if (this._databaseHandler) {
            await this._databaseHandler.close();
            this._resetDatabaseHandler();
            console.log('closing connection uh')
        }
    }
}


module.exports.UserHandler = UserHandler;