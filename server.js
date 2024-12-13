require('dotenv').config();
const express = require('express');
var session = require('express-session');
const app = express();

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

var passport = require('passport');
var GoogleStrategy = require('passport-google-oidc');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/oauth2/redirect/google',
    scope: ['profile', 'email']
},
    (issuer, profile, cb) => {
        return cb(null, profile)
    }
))

passport.serializeUser(function(user, cb) {
    process.nextTick(function() {
      cb(null, {id: user.id, username: user.username, name: user.name, email: user.email });
    });
});

passport.deserializeUser(function(user, cb) {
    process.nextTick(function() {
      return cb(null, user);
    });
});

// app.get('/', (req,res) => res.send('welcome home'))
app.get('/login/federated/google',
    passport.authenticate('google') // this gets executed when user visit http://localhost:3000/login/federated/google
)


app.use(passport.authenticate('session'));

// app.get('/oauth2/redirect/google', passport.authenticate('google', {
//   successRedirect: `pozse://verify/email=`,
//   failureRedirect: 'pozse://login'
// }))

app.get('/oauth2/redirect/google', function(req, res, next) {
    passport.authenticate('google', function(err, user, info, status) {
        if (err) { return next(err) }
        if (!user) { return res.redirect('pozse://login/email') }
        res.redirect(`pozse://verify/email=${user}`);
      })(req, res, next);
    }
)

// app.get('/protected', function(req, res, next) {
//  passport.authenticate('local', function(err, user, info, status) {
//    if (err) { return next(err) }
//    if (!user) { return res.redirect('/signin') }
//    res.redirect('/account');
//  })(req, res, next);
// });


const port = process.env.PORT || 3000; // You can use environment variables for port configuration
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});