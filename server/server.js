require('./config/config');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());

// db
const { sequalize } = require('./db/mysql');
const { User } = require('./models/user');

app.post('/login', (req, res) => {
    const { email, password } = req.body;

    User.findByCredentials(email, password)
        .then((user) => {
            return user.generateToken();
        })
        .then((token) => {
            res.header('x-auth', token)
                .send(token);
        })
        .catch((err) => {
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
        .catch(() => {
            res.status(400)
                .send();
        })
})

// TODO: remove this
app
    .set('views', path.join(`${__dirname}/../`, 'views'))
    .set('view engine', 'ejs');

// TODO: remove this
app.get('/', (req, res) => {
    //console.log(req.user);
    return res.render('index');
});

app.listen(3000, () => {
    console.log('server up');
});