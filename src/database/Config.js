const databaseConfig = {
    connection: {
        password: 'root',
        user: 'root',
        host: 'localhost',
        port: 33060,
    },
    schema: {
        name: 'CHATSERVER',
        table: {
            usercred: 'usercred',
            messagerec: 'messagerec'
        }
    }
}

module.exports.databaseConfig = databaseConfig;