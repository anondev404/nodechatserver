const { DatabaseHandler } = require('./DatabaseHandler');
const { databaseConfig } = require('./Config');

class UserHandler {

    static get databaseHandler() { return DatabaseHandler.getHandler(); }

    static async table() {
        //gets USERCRED table from database
        let dHandler = await UserHandler.databaseHandler;
        return await dHandler.schema.getTable(databaseConfig.schema.table.usercred);
    }

    static async getUserId(username) {
        let usercredTable = await UserHandler.table();

        let userid = await usercredTable
            .select('user_id')
            .where('username = :username')
            .bind('username', username)
            .execute();

        return userid.fetchOne()[0];
    }

    static async createUser(username, password) {
        let usercredTable = await UserHandler.table();

        try {
            //todo: username, password not parsed
            await usercredTable
                .insert('username', 'password')
                .values(username, password)
                .execute();

            console.log('user created');

        } catch (err) {
            console.error('failed: user not created');
        }
    }

    static async fetchAllUsers() {
        let usercredTable = await UserHandler.table();

        let tableData = await usercredTable
            .select()
            .execute();

        console.log(tableData);

        return tableData;
    }
}


module.exports.UserHandler = UserHandler;