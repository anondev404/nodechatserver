const { UserHandler } = require('../database/UserHandler');

const express = require('express');

const app = express();

app.use(express.json());

const port = 3000;

app.post('/signUp', async function (req, res) {
    const cred = req.body;
    console.log(cred.username);
    try {
        let flag = await UserHandler.getHandler().createUser(cred.username, cred.password);
        if (flag === 1) {
            res.send({
                msg: 'Account Created'
            });
        } else {
            throw new Error('SIGNUP FAILED');
        }
    } catch (err) {
        console.log(err);
        res.send({
            msg: 'OOPS! cannot create your account'
        });
    }
});



app.listen(port, () => {
    console.log(`SERVER STARTED ON ${port}`)
});