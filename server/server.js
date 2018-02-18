require('./config/config');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());

// db
const { sequalize } = require('./db/mysql');
const { User } = require('./models/user');
const { authenticate } = require('./middleware')

app.post('/login', (req, res) => {
    const { email, password } = req.body;

    User.findByCredentials(email, password)
        .then((user) => {
            return user.generateToken();
        })
        .then((token) => {
            res.header('x-auth', token)
                .send({});
        })
        .catch((err) => {
            console.log(err);
            res.status(400).send();
        });
});

app.post('/users', (req, res) => {
    const {
        email,
        password,
        firstName,
        lastName
    } = req.body;

    const user = User.build({
        email,
        password,
        firstName,
        lastName
    });

    user.save()
        .then((savedUser) => {
            res.send(savedUser.toJSON());
        })
        .catch((error) => {
            res.status(400)
                .send();
        })
});

app.get('/me', authenticate, (req, res) => {
    res.send({});
})

app.listen(3000, () => {
    console.log('server up');
});