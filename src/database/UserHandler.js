const { DatabaseHandler } = require('./DatabaseHandler');
const { MessageHandler } = require('./MessageHandler');
const { databaseConfig } = require('./Config');

class UserHandler {
    _databaseHandler;

    static getHandler() {
        return new UserHandler();
    }

    async _getDatabaseHandler() {
        if (!this._databaseHandler) this._databaseHandler = await DatabaseHandler.getHandler();

        return this._databaseHandler;
    }

    async _table() {
        //gets USERCRED table from database
        let dHandler = await this._getDatabaseHandler();
        return await dHandler.schema.getTable(databaseConfig.schema.table.usercred);
    }

    async _getUserId(username) {
        let usercredTable = await this._table();

        let userid = await usercredTable
            .select('user_id')
            .where('username = :username')
            .bind('username', username)
            .execute()
            .fetchOne()[0];

        await this._getDatabaseHandler.close();

        return userid;
    }

    async createUser(username, password) {
        let usercredTable = await this._table();

        const dHandler = await this._getDatabaseHandler();
        dHandler.startTransaction();

        try {
            //todo: username, password not parsed
            await usercredTable
                .insert('username', 'password')
                .values(username, password)
                .execute();

            console.log('user created');

            dHandler.session.commit();
        } catch (err) {
            console.error('failed: user not created');
            dHandler.session.rollback();
        }

        await dHandler.close();
    }

    async fetchAllUsers() {
        let usercredTable = await this._table();

        let tableData = await usercredTable
            .select()
            .execute();

        console.log(tableData);

        await this._getDatabaseHandler.close();

        return tableData;
    }

    async getConverstation(user1, user2) {
        const userid1 = await this._getUserId(user1);
        const userid2 = await this._getUserId(user2);

        return MessageHandler.getConversation(userid1, userid2);
    }
}


module.exports.UserHandler = UserHandler;