const express = require('express');
const path = require('path');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const config = require('../config.json');

const app = express();

passport.use(
    new GoogleStrategy(
        {
            clientID: config.GOOGLE_CLIENT_ID,
            clientSecret: config.GOOGLE_CLIENT_SECRET,
            callbackURL: `${config.BASE_URL}/auth/google/callback`
        },
        (accessToken, refreshToken, profile, done) => {
            console.log(profile);
            return done(null, profile)
        }
    )
);
app.use(passport.initialize());

app
    .set('views', path.join(`${__dirname}/../`, 'views'))
    .set('view engine', 'ejs');

app.get('/', (req, res) => {
    //console.log(req.user);
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
        console.log('signed in');
        return res.redirect('/');
    }
);

app.listen(3000, () => {
    console.log('server up');
});