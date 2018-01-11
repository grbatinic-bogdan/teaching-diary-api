const Sequelize = require('sequelize');
const { sequelize } = require('../db/mysql');
const jwt = require('jsonwebtoken');

const User = sequelize.define(
    'user',
    {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        googleId: {
            type: Sequelize.STRING,
            unique: true
        },
        email: {
            type: Sequelize.STRING,
            unique: true
        },
        firstName: Sequelize.STRING,
        lastName: Sequelize.STRING,
    },
    {
        underscored: true,
    }
);

User.prototype.generateToken = function() {
    return jwt.sign(
        {
            id: this.id,
            email: this.email
        },
        process.env.jwtSecret,
        {
            expiresIn: 3600 // one hour
        }
    ).toString();
};

User.sync()
    .then(() => {
        console.log('User table created');
    })

module.exports = {
    User
}