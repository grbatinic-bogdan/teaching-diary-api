const { User } = require('../models/user');
const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
    const token = req.header('x-auth');

    let decoded = undefined;
    try {
        decoded = jwt.verify(token, process.env.jwtSecret);
    } catch(err) {
        res.status(401).send();
    }

    return User.findById(decoded.id)
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

const cors = (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-auth");
    res.header("Access-Control-Expose-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-auth");
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
    //res.header("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin, Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");

    next();
}

module.exports = {
    authenticate,
    cors
};