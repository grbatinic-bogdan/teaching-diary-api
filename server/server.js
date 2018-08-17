require('./config/config');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const moment = require('moment');

const app = express();



// db
const { sequalize } = require('./db/mysql');
const { TimeEntry, User, Location } = require('./models');
const { authenticate, cors } = require('./middleware');

app.use(bodyParser.json());
app.use(cors);

app.post('/login', (req, res) => {
    const { email, password } = req.body;

    User.findByCredentials(email, password)
        .then((user) => {
            return Promise.all([
                user.generateToken(),
                Promise.resolve(user)
            ]);
        })
        .then(([token, user]) => {
            res.header('x-auth', token)
                .send(user.toJSON());
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

/**
 * TODO: refactor so create method includes both models
 */
app.post('/time-entry', authenticate, (req, res) => {
    const {
        name,
        description,
        time: timeInput,
        duration,
        // location: locationId,
        location: locationData,
        individual,
        status,
    } = req.body;


    const locationPromise = new Promise((resolve, reject) => {
        if (locationData) {
            const locationTransaction = Location.findOrCreate({
                where: {
                    address: locationData.address
                },
                defaults: {
                    latitude: locationData.latitude,
                    longitude: locationData.longitude
                }
            });

            resolve(locationTransaction);
        }

        reject('Location data missing');
    })
    .then(([locationModel, created]) => {
        return locationModel.toJSON();
    })
    .catch((error) => {
        // no location given, resolve
        return Promise.resolve(false);
    })


    /*
    if (locationData !== '') {
        if (locationData.address !== '') {
            locationPromise = Location.findOrCreate({
                where: {
                    address: locationData.address
                }
            });
        } else {
            locationPromise = Promise.resolve(locationData)
        }

    } else {
        locationPromise = Promise.resolve(locationData);
    }
    */


    // const locationPromise = Location.findById(locationId);
    const userPromise = User.findById(req.user.id);

    const time = moment.utc(timeInput).format('YYYY-MM-DD HH:mm:ss');
    const timeEntryPromise = TimeEntry.create(
        {
            name,
            time,
            duration,
            individual,
            status,
        }
    );

    Promise.all([locationPromise, userPromise, timeEntryPromise])
        .then((promises) => {
            const [location, user, timeEntry] = promises;
            const addUserPromise = timeEntry.setUser(user.id);
            const addLocationPromise = (location) ? timeEntry.setLocation(location.id) : Promise.resolve();

            return Promise.all([addUserPromise, addLocationPromise])
                .then(() => {
                    return timeEntry;
                })
                .catch((error) => {
                    return Promise.reject(error);
                })
        })
        .then((savedTimeEntry) => {
            res.send(savedTimeEntry.toJSON());
        })
        .catch((error) => {
            res.status(400)
                .send({});
        });

});

app.get('/time-entry', authenticate, (req, res) => {
    TimeEntry.findAll({
        where: {
            user_id: req.user.id
        },
        include: [{
            model: Location,
            as: 'location'
        }]
    })
        .then((timeEntries) => {
            res.send(timeEntries);
        })
        .catch((error) => {
            res.status(400)
                .send();
        });
});

app.get('/time-entry/:id', authenticate, (req, res) => {
    TimeEntry.findOne({
        where: {
            id: req.params.id
        },
        include: [{
            model: Location,
            as: 'location'
        }]
    })
    .then((timeEntry) => {
        res.send(timeEntry.toJSON());
    })
    .catch(() => {
        res.status(401).send();
    })
});

app.put('/time-entry/:id', authenticate, (req, res) => {
    TimeEntry.findOne({
        where: {
            id: req.params.id
        },
        include: [{
            model: Location,
            as: 'location'
        }]
    })
    .then((foundTimeEntry) => {
        if (foundTimeEntry) {
            return Promise.resolve(foundTimeEntry);
        }

        return res.status(401).send();
    })
    .then((foundTimeEntry) => {
        const {
            location: locationData
        } = req.body;

        const location = new Promise((resolve, reject) => {
            if (locationData) {
                const locationTransaction = Location.findOrCreate({
                    where: {
                        address: locationData.address
                    },
                    defaults: {
                        latitude: locationData.latitude,
                        longitude: locationData.longitude
                    }
                });
                resolve(locationTransaction);
            }

            reject('No location provided');
        })
        .then(([locationModel, created]) => locationModel.toJSON())
        .catch((error) => null);

        return Promise.all([foundTimeEntry, location]);
    })
    .then(([foundTimeEntry, location]) => {
        const {
            name,
            description,
            time: timeInput,
            duration,
            individual,
            status,
        } = req.body;
        const timeObject = moment(timeInput);
        if (!timeObject.isValid()) {
            throw new Error('Invalid time selected');
        }
        const time = timeObject.format('YYYY-MM-DD HH:mm:ss');
        if (location) {
            foundTimeEntry.setLocation(location.id);
        } else {
            foundTimeEntry.setLocation(null);
        }
        return foundTimeEntry.update(
            {
                name,
                description,
                time,
                individual,
                duration,
                status
            }
        );
    })
    .then((timeEntry) => timeEntry.reload())
    .then((reloadedTimeEntry) => res.send(reloadedTimeEntry.toJSON()))
    .catch((error) => {
        res.status(400).send();
    })
});

app.delete('/time-entry/:id', authenticate, (req, res) => {
    TimeEntry.findOne({
        where: {
            id: req.params.id
        }
    })
    .then((timeEntry) => {
        return timeEntry.destroy();
    })
    .then(() => {
        res.send({});
    })
    .catch((error) => {
        res.status(400).send();
    })
});

app.get('/me', authenticate, (req, res) => {
    const user = req.user.toJSON();
    res.send(user);
});

app.listen(8000, () => {
    console.log('server up');
});