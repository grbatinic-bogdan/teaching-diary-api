const { User } = require('./../models/user');
const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
    const token = req.header('x-auth');

    let decoded = undefined;
    try {
        decoded = jwt.verify(token, process.env.jwtSecret);
    } catch(err) {
        return Promise.reject('Unathorized');
    }

    User.findById(decoded.id)
        .then((user) => {
            if (!user) {
                return Promise.reject('User not found');
            }

            req.user = user;
            next();
        })
        .catch(error => {
            res.status(401).send({});
        });
};

module.exports = {
    authenticate
};