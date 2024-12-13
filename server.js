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
    scope: ['profile']
},
    (issuer, profile, cb) => {
        return cb(null, profile)
    }
))

passport.serializeUser(function(user, cb) {
    process.nextTick(function() {
      cb(null, {id: user.id, username: user.username, name: user.name });
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

app.get('/oauth2/redirect/google', passport.authenticate('google', {
  successRedirect: 'pozse://verify/',
  failureRedirect: 'pozse://login'
}))


// app.use(express.static(path.join(__dirname, 'public')));


const port = process.env.PORT || 3000; // You can use environment variables for port configuration
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});