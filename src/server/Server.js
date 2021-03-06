const { UserHandler } = require('../database/UserHandler');

const express = require('express');

const session = require('express-session');
const { UserNotFoundException } = require('../database/exception/UserNotFoundException');

const uuidv4 = require('uuid').v4;

const uuidv5 = require('uuid').v5;

const app = express();

const port = 3000;

//using express json middleware
app.use(express.json());

app.use(session({
    name: 'chatserver',
    secret: uuidv5('www.myownchatserver.com', uuidv5.URL),
    genid: () => {
        return uuidv4();
    },
    cookie: {
        path: '/',
        maxAge: 604800000,
        httpOnly: true,
    }
}));



app.get('/signIn', async function (req, res) {
    const cred = req.body;
    console.log(cred.username);
    try {
        let flag = await UserHandler.getHandler().validateUser(cred.username, cred.password);
        if (flag === 1) {

            //saving the username in session data
            req.session.username = cred.username;

            res.send({
                message: `Welcome to chatserver ${req.session.username}`
            });
        } else {
            if (flag === 0) {

                res.send({
                    message: 'Invalid username or password'
                });
            } else {
                throw new Error('SIGNIN FAILED');
            }
        }
    } catch (err) {
        console.log(err);

        //user to send message does not exits
        if (err instanceof UserNotFoundException) {
            res.send({
                message: err.message
            });
            return;
        }

        res.send({
            message: 'OOPS! cannot signin'
        });
    }
});

app.post('/signUp', async function (req, res) {
    const cred = req.body;

    try {
        let flag = await UserHandler.getHandler().createUser(cred.username, cred.password);

        if (flag === 1) {

            res.send({
                message: 'Account Created'
            });
        } else {
            if (flag === 0) {

                res.send({
                    message: 'Account already exits'
                });
            } else {
                throw new Error('SIGNUP FAILED');
            }
        }
    } catch (err) {
        console.log(err);

        res.send({
            message: 'OOPS! cannot create your account'
        });
    }
});

//checks if user has an active session
const userSessionLoginValidation = (req, res, next) => {
    /*next();
    return;*/

    if (req.session.username) {
        next();
        return;
    }

    res.send({
        message: 'User not recognized. Please signin.'
    });
}

app.get('/signOut', userSessionLoginValidation, async function (req, res) {
    req.session.destroy();

    res.send({
        message: 'User signed out'
    });
});


app.post('/sendMessage', userSessionLoginValidation,
    async function (req, res) {
        const info = req.body;
        try {
            await UserHandler
                .getHandler()
                .sendMessage(req.session.username, info.receiverUsername, info.message);

            res.send({
                message: 'Message sent successfully'
            });
        } catch (err) {
            console.log(err);

            //user to send message does not exits
            if (err instanceof UserNotFoundException) {
                res.send({
                    message: err.message
                });
                return;
            }

            res.send({
                message: 'OOPS! Message not sent'
            });
        }
    });

app.get('/viewMessages', userSessionLoginValidation,
    async function (req, res) {
        const info = req.body;

        try {
            console.log(`fetching messages of: ${req.session.username} ${info.receiverUsername}`);

            const conversationCursor = await UserHandler
                .getHandler()
                .getConverstation(req.session.username, info.receiverUsername);

            const messages = await conversationCursor.fetchAll();

            res.send({
                allConverstation: messages,
                messages: 'All messages fetched'
            });
        } catch (err) {
            console.log(err);

            //user to send message does not exits
            if (err instanceof UserNotFoundException) {
                res.send({
                    message: err.message
                });
                return;
            }

            res.send({
                message: 'OOPS! Failed to fetch messages'
            });
        }
    });


app.get('/search/user', userSessionLoginValidation,
    async function (req, res) {
        const query = req.body;

        try {
            const userCursor = await UserHandler
                .getHandler()
                .searchUser(query);

            const allMatchedUsers = await userCursor.fetchAll();

            if (allMatchedUsers) {

                res.send({
                    allMatchedUsers: allMatchedUsers,
                    messages: 'Matched users fetched'
                });
            } else {

                res.send({
                    allMatchedUsers: null,
                    messages: 'No matching users'
                });
            }
        } catch (err) {
            console.log(err);

            res.send({
                allMatchedUsers: null,
                message: 'OOPS! technical issues'
            });
        }
    });




app.listen(port, () => {
    console.log(`SERVER STARTED ON ${port}`)
});