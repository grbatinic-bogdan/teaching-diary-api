const Sequelize = require('sequelize');
const { sequelize } = require('../db/mysql');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const User = sequelize.define(
    'user',
    {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        email: {
            type: Sequelize.STRING,
            unique: true
        },
        firstName: Sequelize.STRING,
        lastName: Sequelize.STRING,
        password: Sequelize.STRING
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

User.prototype.toJSON = function() {
    return {
        email: this.email,
        firstName: this.firstName,
        lastName: this.lastName
    };
};

User.findByCredentials = function(email, password) {
    return User.findOne({
        where: {
            email
        }
    })
        .then((user) => {
            if (user) {
                return user;
            }

            return Promise.reject('User not found. Email does not exist');
        })
        .then((user) => {
            return new Promise((resolve, reject) => {
                bcrypt.compare(password, user.password, (err, res) => {
                    (res) ? resolve(user) : reject('Wrong password');
                })
            });
        });
}

User.beforeSave((user, options) => {
    return new Promise((resolve, reject) => {
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(user.password, salt, function(err, hash) {
                user.password = hash;
                resolve(hash);
            });
        });
    });
});

User.sync()
    .then(() => {
        console.log('User table created');
    })

module.exports = {
    User
}