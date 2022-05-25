const mysqlx = require('@mysql/xdevapi');
const { databaseConfig } = require('./Config');

class DatabaseHandler {
    _session;
    _schema;

    async _init() {
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
        let handler = new DatabaseHandler();
        await handler._init();

        console.log('databasehandler initilized');

        return handler;
    }

    async close() {
        await this._databaseHandler.close();
    }
}

module.exports.DatabaseHandler = DatabaseHandler;