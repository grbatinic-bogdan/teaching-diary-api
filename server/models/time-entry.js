const Sequelize = require('sequelize');
const { sequelize } = require('../db/mysql');
const { User } = require('./user');
const { Location } = require('./location');

const TimeEntry = sequelize.define(
    'time_entry',
    {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: Sequelize.STRING
        },
        time: {
            type: Sequelize.DATE
        },
        duration: {
            type: Sequelize.INTEGER
        },
        individual: {
            type: Sequelize.BOOLEAN
        },
        status: {
            type: Sequelize.STRING
        },
        description: {
            type: Sequelize.TEXT
        },
    },
    {
        underscored: true,
    }
);

TimeEntry.belongsTo(User, {
    as: 'user',
    foreignKey: 'user_id',
    targetKey: 'id'
});
TimeEntry.belongsTo(Location, {
    as: 'location',
    foreignKey: 'location_id',
    targetKey: 'id'
});

module.exports = TimeEntry;

