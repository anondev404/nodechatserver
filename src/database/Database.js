const mysqlx = require('@mysql/xdevapi');
const { databaseConfig } = require('./Config');

class DatabaseHandler {
    _session;
    _schema;

    static _databaseHandler;

    constructor() {
        DatabaseHandler._databaseHandler = this;
    }

    async init() {
        await this._setSession();
        await this._setSchema();
        console.log('Database handler initialized');
    }

    async _setSession() {
        this._session = await mysqlx.getSession(databaseConfig.connection);
        if (this._session) {
            console.log('session set');
        }
    }

    async _setSchema() {
        this._schema = await this._session.getSchema(databaseConfig.schema.name);
    }

    get session() {
        return this._session;
    }

    get schema() {
        return this._schema;
    }

    static async getHandler() {
        if (this._databaseHandler) {
            return this._databaseHandler;
        }

        let handler = new DatabaseHandler();
        await handler.init();

        return handler;
    }
}

class UserHandler {

    static async fetchAllUsers() {
        let dHandler = await DatabaseHandler.getHandler();
        let userCredTable = await dHandler.schema.getTable(databaseConfig.schema.table.usercred);

        let tableData = await userCredTable
            .select()
            .execute();

        console.log(tableData);
    }
}

module.exports.DatabaseHandler = DatabaseHandler;

module.exports.UserHandler = UserHandler;