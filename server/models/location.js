const Sequelize = require('sequelize');
const { sequelize } = require('../db/mysql');
const TimeEntry = require('./time-entry');

const Location = sequelize.define(
    'location',
    {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        address: {
            type: Sequelize.STRING
        },
        latitude: {
            type: Sequelize.DECIMAL(9, 6)
        },
        longitude: {
            type: Sequelize.DECIMAL(9, 6)
        }
    },
    {
        underscored: true,
    }
);

//Location.hasMany(TimeEntry);

module.exports = {
    Location
}