const { UserHandler } = require('../database/UserHandler');

const express = require('express');

const session = require('express-session');

const uuidv4 = require('uuid').v4;

const app = express();

//using express json middleware
app.use(express.json());

app.use(session({
    name: 'chatserver',
    secret: 'chatserver',
    genid: () => {
        return uuidv4();
    },
    cookie: {
        path: '/',
        maxAge: 604800000,
        httpOnly: true,
    }
}));

const port = 3000;

app.get('/signIn', async function (req, res) {
    const cred = req.body;
    console.log(cred.username);
    try {
        let flag = await UserHandler.getHandler().validateUser(cred.username, cred.password);
        if (flag === 1) {

            res.send({
                message: 'Welcome to chatserver'
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

        res.send({
            message: 'OOPS! cannot signin'
        });
    }
});

app.post('/signUp', async function (req, res) {
    const cred = req.body;
    console.log(cred.username);
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

app.post('/sendMessage', async function (req, res) {
    const info = req.body;
    try {
        await UserHandler
            .getHandler()
            .sendMessage(info.senderUsername, info.receiverUsername, info.message);

        res.send({
            message: 'Message sent successfully'
        });
    } catch (err) {
        console.log(err);

        res.send({
            message: 'OOPS! Message not sent'
        });
    }
});

app.get('/viewMessages', async function (req, res) {
    const info = req.body;
    try {
        const conversationCursor = await UserHandler
            .getHandler()
            .getConverstation(info.senderUsername, info.receiverUsername);

        const messages = await conversationCursor.fetchAll();

        res.send({
            allConverstation: messages,
            messages: 'All messages fetched'
        });
    } catch (err) {
        console.log(err);

        res.send({
            message: 'OOPS! Failed to fetch messages'
        });
    }
})



app.listen(port, () => {
    console.log(`SERVER STARTED ON ${port}`)
});