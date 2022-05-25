const mysqlx = require('@mysql/xdevapi');
const { databaseConfig } = require('./Config');

class DatabaseHandler {
    _client;
    _session;
    _schema;

    async _init() {
        await this._setClient();
        await this._setSession();
        await this._setSchema();
        console.log('database initilized');
    }

    async _setClient() {
        this._client = await mysqlx.getClient(
            databaseConfig.connection,
            {
                pooling: {
                    enabled: true,
                    maxSize: 25
                }
            }
        );
    }

    async _setSession() {
        try {
            this._session = await this.client.getSession(databaseConfig.connection);
            console.log('session initilized');
        } catch (err) {
            console.error('failed: session not initilized');
        }
    }

    async _setSchema() {
        try {
            this._schema = await this.session.getSchema(databaseConfig.schema.name);
            console.log('schema fetched');
        } catch (err) {
            console.error('failed: schema could not be fetched');
        }
    }

    get client() {
        return this._client;
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

    get isConnectionOpen() {
        return this.session.getConnection_().isOpen();
    }

    async close() {
        await this.session.close();
    }
}

module.exports.DatabaseHandler = DatabaseHandler;