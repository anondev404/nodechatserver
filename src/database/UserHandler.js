const { DatabaseHandler } = require('./DatabaseHandler');
const { MessageHandler } = require('./MessageHandler');
const { databaseConfig } = require('./Config');

const { UserNotFoundException } = require('./exception/UserNotFoundException');

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

        //gets the first result row
        const useridResultRow = await useridCursor.fetchOne();

        if (!useridResultRow) {
            throw new UserNotFoundException(username)
        }


        return useridResultRow[0];
    }

    async validateUser(username, password) {
        //password accepted as clear text

        let usercredTable = await this._table();

        try {
            const useridResultRow = await this._getUserId(username);

            const usernameCursor = await usercredTable
                .select('username')
                .where('user_id = :userid and password = :password')
                .bind('userid', useridResultRow)
                .bind('password', password)
                .execute();

            //gets the first result row
            const usernameRowResult = await usernameCursor.fetchOne();

            if (usernameRowResult) {

                //1 returned when username, password is matched in database
                return 1;
            } else {

                //0 is returned when username or password does not match in database
                return 0;
            }

        } catch (err) {
            console.log(err);

            //rethrows UserNotFoundException
            if (err instanceof UserNotFoundException) {

                throw err;
            }

            //-1 is returned halted due to some other exception
            return -1;
        }
    }

    async createUser(username, password) {
        console.log('creating user');
        let usercredTable = await this._table();

        const dHandler = await this._getDatabaseHandler();
        await dHandler.session.startTransaction();

        try {
            //todo: username, password not parsed
            const sqlRes = await usercredTable
                .insert('username', 'password')
                .values(username, password)
                .execute();

            await dHandler.session.commit();

            //on acct created
            return 1;
        } catch (err) {
            console.log(err);

            if (err.info) {
                if (err.info.code === 1062) {
                    //acct info already exits in database
                    return 0;
                }
            }

            await dHandler.session.rollback();

            //on other reasonn acct creation failure
            return -1;
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

    async getConverstation(username1, username2) {
        const userid1 = await this._getUserId(username1);
        const userid2 = await this._getUserId(username2);


        await this._closeConnection();

        let msgHanlder = MessageHandler.getHandler();

        return await msgHanlder.getConversation(userid1, userid2);
    }

    async sendMessage(senderUsername, receiverUsername, message) {
        const senderUserId = await this._getUserId(senderUsername);
        const receiverUserId = await this._getUserId(receiverUsername);

        await this._closeConnection();

        let msgHanlder = MessageHandler.getHandler();

        return await msgHanlder.createMessage(senderUserId, receiverUserId, message);
    }

    /*
    takes an 'query' object
    {
        term: 'the query using which to search the user'
    }
    */
    async searchUser(query) {
        let usercredTable = await this._table();

        try {
            const userCursor = await usercredTable
                .select('username')
                .where(`username like :termLike1
                     or username like :termLike2
                     or username like :termLike3`)
                .bind('termLike1', `${query.term}%`)
                .bind('termLike2', `%${query.term}%`)
                .bind('termLike3', `%${query.term}`)
                .execute();

            await this._closeConnection();

            return userCursor;
        } catch (err) {
            console.log(err);

            return -1;
        }
    }

    //sets the _databaseHandler object to null
    _resetDatabaseHandler() {
        this._databaseHandler = null;
    }

    //releases the database connection to pool
    async _closeConnection() {
        if (this._databaseHandler) {
            await this._databaseHandler.close();
            this._resetDatabaseHandler();
            console.log('closing connection uh')
        }
    }
}


module.exports.UserHandler = UserHandler;