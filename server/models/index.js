const TimeEntry = require('./time-entry');
const { User } = require('./user');
const { Location } = require('./location');

const modelOrder = [
    User,
    Location,
    TimeEntry,
];

modelOrder.forEach(model => {
    model.sync()
        .then(() => {
            //console.log(`Model table has been created`);
        })
        .catch(error => {
            console.log(error);
        })
})

/*
Location.sync()
    .then(() => {
        return Promise.resolve();
    })
    .then(() => {
        console.log('Location table has been created');
        return User.sync()
    })
    .then(() => {
        console.log('User table created');
        return TimeEntry.sync()
    })
    .then(() => {
        console.log('Time entry table created');
    })
    .catch((error) => {
        console.log(`Unable to create schema. Error: ${error.message}`);
    })
*/

module.exports = {
    User,
    Location,
    TimeEntry
};