const { UserHandler } = require('../database/UserHandler');

const express = require('express');

const app = express();

//using express json middleware
app.use(express.json());

const port = 3000;

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