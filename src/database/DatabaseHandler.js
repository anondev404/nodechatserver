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
        console.log('database initilized');
    }

    async _setSession() {
        try {
            this._session = await mysqlx.getSession(databaseConfig.connection);
            console.log('session initilized');
        } catch (err) {
            console.error('failed: session not initilized');
        }
    }

    async _setSchema() {
        try {
            this._schema = await this._session.getSchema(databaseConfig.schema.name);
            console.log('schema fetched');
        } catch (err) {
            console.error('failed: schema could not be fetched');
        }
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

        console.log('databasehandler initilized');

        return handler;
    }
}

module.exports.DatabaseHandler = DatabaseHandler;