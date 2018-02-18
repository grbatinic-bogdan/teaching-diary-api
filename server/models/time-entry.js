const Sequelize = require('sequelize');
const { sequelize } = require('../db/mysql');

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

module.exports = TimeEntry;

