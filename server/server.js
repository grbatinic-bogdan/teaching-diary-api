require('./config/config');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const moment = require('moment');

const app = express();

app.use(bodyParser.json());

// db
const { sequalize } = require('./db/mysql');
const { TimeEntry, User, Location } = require('./models');
const { authenticate } = require('./middleware');

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

app.post('/locations', authenticate, (req, res) => {
    const {
        address,
        latitude,
        longitude
    } = req.body;

    const location = Location.build({
        address,
        latitude,
        longitude
    });

    location.save()
        .then((savedLocation) => {
            res.send(location.toJSON());
        })
        .catch((error) => {
            res.status(400)
                .send();
        })
});

app.get('/locations', authenticate, (req, res) => {
    Location.findAll()
        .then((locations) => {
            res.send(locations);
        })
        .catch((error) => {
            res.status(400)
                .send();
        })
});

app.post('/time-entry', authenticate, (req, res) => {
    const {
        name,
        description,
        time: timeInput,
        duration,
        location: locationId,
        individual,
        status,
    } = req.body;

    const locationPromise = Location.findById(locationId);
    const userPromise = User.findById(req.user.id);

    Promise.all([locationPromise, userPromise])
        .then((promises) => {
            const [user, location] = promises;

            const time = moment.utc(timeInput).format('YYYY-MM-DD HH:mm:ss');
            const timeEntry = TimeEntry.build({
                name,
                time,
                duration,
                individual,
                status,
            });

            const addUserPromise = timeEntry.addUser(user);
            const addLocationPromise = timeEntry.addLocation(location);


            return timeEntry;
        })
        .then((timeEntry) => {
            return timeEntry.save()
        })
        .then((savedTimeEntry) => {
            res.send(savedTimeEntry.toJSON());
        })
        .catch((error) => {
            res.status(400)
                .send({});
        });

});

app.get('/me', authenticate, (req, res) => {
    res.send({});
})

app.listen(3000, () => {
    console.log('server up');
});