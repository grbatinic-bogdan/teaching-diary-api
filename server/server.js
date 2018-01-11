require('./config/config');
const express = require('express');
const path = require('path');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

const app = express();

// db
const { sequalize } = require('./db/mysql');
const { User } = require('./models/user');

const util = require('util');
const {
    clientID,
    clientSecret,
    callbackURL
} = process.env;

passport.use(
    new GoogleStrategy(
        {
            clientID,
            clientSecret,
            callbackURL
        },
        (accessToken, refreshToken, profile, done) => {
            User.findOrCreate({
                where: {
                    googleId: profile.id,
                },
                defaults: {
                    firstName: profile.name.givenName,
                    lastName: profile.name.familyName,
                    email: profile.emails[0].value
                }
            })
            .spread((user, created) => done(null, user));
        }
    )
);
app.use(passport.initialize());

// TODO: remove this
app
    .set('views', path.join(`${__dirname}/../`, 'views'))
    .set('view engine', 'ejs');

// TODO: remove this
app.get('/', (req, res) => {
    return res.render('index');
});

app.get('/auth/google', passport.authenticate('google', {
    scope: ['openid email profile'],
    session: false
}));

app.get('/auth/google/callback',
    passport.authenticate('google', {
        failureRedirect: '/',
        session: false
    }),
    (req, res) => {
        // create token here
        const token = req.user.generateToken();
        const {
            email,
            firstName,
            lastName
        } = req.user;
        res.header('x-auth', token).send({
            email,
            firstName,
            lastName
        });
    }
);

app.listen(3000, () => {
    console.log('server up');
});