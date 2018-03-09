const Sequelize = require('sequelize');
const { sequelize } = require('../db/mysql');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const TimeEntry = require('./time-entry');

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
        firstName: {
            type: Sequelize.STRING,
        },
        lastName: {
            type: Sequelize.STRING
        },
        password: {
            type: Sequelize.STRING
        }
    },
    {
        underscored: true,
    }
);

//User.hasMany(TimeEntry);

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

User.prototype.toJSON = () => {
    return {
        email: this.email,
        firstName: this.firstName,
        lastName: this.lastName
    };
};

User.findByCredentials = (email, password) => {
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

User.findByToken = (token) => {
    let decoded;
    try {
        decoded = jwt.verify(token, process.env.jwtSecret);
    } catch(error) {
        return Promise.reject('Unauthorized');
    }

    return User.findOne({
        where: {
            id: decoded.id,
            email: decoded.email
        }
    })
    .then((user) => {
        if (user) {
            return user;
        }

        return Promise.reject('User not found');
    })
    .catch(() => {
        return Promise.reject('Unauthorized');
    })

};

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

module.exports = {
    User
}