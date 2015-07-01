var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    morgan = require('morgan'),
    methodOverride = require('method-override'),
    session = require("cookie-session"),
    jquery = require('jquery'),
    request = require('request'),
    passport = require('passport'),
    util = require('util'),
    MeetupStrategy = require('passport-meetup').Strategy;
    db = require('./models');
    loginMiddleware = require("./middleware/login");
    routeMiddleware = require("./middleware/route");


var MEETUP_KEY = 'psnnhjuq85ps4olm79uia7j908';
var MEETUP_SECRET = 'e5gdob0s5ludcqn3f1ca7fon8p';


app.set('view engine', 'ejs');
app.use(morgan('tiny'));
app.use(methodOverride('_method'));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(loginMiddleware);
app.use(passport.initialize());
app.use(passport.session());


app.use(session({
  maxAge: 3600000,
  secret: 'kittystuff',
  name: "meow",
  cookie: { secure: true }
}));



passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});


passport.use(new MeetupStrategy({
    consumerKey: MEETUP_KEY,
    consumerSecret: MEETUP_SECRET,
    callbackURL: "http://127.0.0.1:3000/auth/meetup/callback"
  },
  function(token, tokenSecret, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      
      // To keep the example simple, the user's Meetup profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the Meetup account with a user record in your database,
      // and return that user instead.
      //var userId = profile._raw[1];
      console.log(profile);
      return done(null, profile);
    });
  }
));


//ROOT login to MY APP
//renders the page that allows the user to either login or signup
app.get('/', function(req,res){
  res.render('users/index');
});


app.get('/account', ensureAuthenticated, function(req, res){
  res.render('meetup/account', { user: req.user });
});


app.get('/meetup/login', function(req, res){
  res.render('meetup/login', { user: req.user });
});


app.get('/auth/meetup',
  passport.authenticate('meetup'),
  function(req, res){
    // The request will be redirected to Meetup for authentication, so this
    res.redirect('/calendar');
});
//106e22471225a592b2d645054136


app.get('/auth/meetup/callback', 
passport.authenticate('meetup', { failureRedirect: '/meetup/login' }),
function(req, res) {
  res.redirect('/calendar');
});


app.get('/searchresults', ensureAuthenticated, function(req, res) {
  var url = 'https://api.meetup.com/2/events?&sign=true&photo-host=public&rsvp=yes&member_id=86247062&page=20';
  request.get(url, function(error, response, body) {
    console.log(response.statusCode);
    if (error) {
      console.log('error!');
    } else if (!error && response.statusCode != 200) {
      console.log('error!');
    } else if (!error && response.statusCode === 200) {
      res.send(body);
      //res.send('searchresults', JSON.parse(body));
    } else {
      console.log('error!');
    }
    
  });
  
});


//get the signup page. if the user is already signed in, redirect them to
//the '/events' route (this is done in the routeMiddleware.preventLoginSignup)
app.get('/signup', routeMiddleware.preventLoginSignup ,function(req,res){
  res.render('users/signup');
});


//submit the signup page with the 'post' method. Crete a new user from the form input
//and save it to the database.
app.post("/signup", function (req, res) {
  var newUser = req.body.user;
  db.User.create(newUser, function (err, user) {
    if (user) {
      req.login(user);
      res.redirect("/calendar");
    } else {
      console.log(err);
      // TODO - handle errors in ejs!
      res.render("users/signup");
    }
  });
});


//get the login page. if the user is already signed in, redirect them to
//the '/events' route (this is done in the routeMiddleware.preventLoginSignup)
app.get("/login", routeMiddleware.preventLoginSignup, function (req, res) {
  res.render("users/login");
});


//submit the login page with the 'post' method. use the authenticate function located
//on the user.js page in models. if there isn't an error and the user is able to log
//in just fine, then redirect
app.post("/login", function (req, res) {
  db.User.authenticate(req.body.user,
  function (err, user) {
    if (!err && user !== null) {
      req.login(user);
      res.redirect("/calendar");
    } else {
      // TODO - handle errors in ejs!
      res.render("users/login", {err:err});
    }
  });
});

//if the user hits the logout link, the user is logged out, and then redirected
//to the '/' route
app.get("/logout", function (req, res) {
  req.logout();
  res.redirect("/");
});


/******* EVENT ROUTES *******/

//CALENDAR
//if the user is logged in (this is done by routeMiddleware.ensureLoggedIn), then render
//the layout page which displays the calendar with all events listed.
app.get('/calendar', routeMiddleware.ensureLoggedIn, function(req,res){
    db.Event.find({user:req.session.id}).populate('user').exec(function(err, events){
      if(err){
        console.log(err);
      }
      else{
        res.render('layout', {theEvents:events,
                              user:req.user});
     }
   });
});



//INDEX (SHOW ALL OF THE USER'S CREATED EVENTS)
app.get('/events', routeMiddleware.ensureLoggedIn, function(req,res){
    db.Event.find({user:req.session.id}).populate('user').exec(function(err, events){
      if(err){
        console.log(err);
      }
      else{
        res.format({
          'text/html': function(){
            res.render("events/index", {theEvents: events});
          },
    
          'application/json': function(){
            res.send({ events: events });
          },
          'default': function() {
            // log the request and respond with 406
            res.status(406).send('Not Acceptable');
          }
        });
      }
   });
});



//GET NEW EVENT PAGE
//once user clicks the 'add a new event' link, render a form to get the information for the
//new event. Also send an object that contains the user's session id.
app.get('/events/new', routeMiddleware.ensureLoggedIn, function(req,res){
  res.render('events/new', {author_id:req.session.id});
})


//CREATE A NEW EVENT
app.post('/events', routeMiddleware.ensureLoggedIn, function(req,res){
  var event = req.body.event;
  console.log(event.description);
  console.log(event);
  db.Event.create(event, function(err, ev){
    if(err){
      console.log(err);
      res.render('/events/new');
    }
    else {
      res.redirect('/calendar');
    }
  });
});



//SHOW AN EVENT
app.get('/events/:id', routeMiddleware.ensureLoggedIn, function(req,res){
  db.Event.findById(req.params.id).populate('user').exec(
    function(err, event){
      console.log(event);
      res.render('events/show', {event:event});
    });
});


//EDIT AN EVENT
app.get('/events/:id/edit', routeMiddleware.ensureLoggedIn, function(req,res){
  db.Event.findById(req.params.id, function(err, event){
    if(err){
      console.log(err);
    }
    else {
      res.render('events/edit', {event:event,
                                 author_id:req.session.id});
    }
  });
});


//UPDATE AN EVENT
app.put('/events/:id', routeMiddleware.ensureLoggedIn, function(req,res){
  var show_page = '/events/' + req.params.id;
  db.Event.findByIdAndUpdate(req.params.id, req.body.event, function(err, event){
    if(err){
      console.log(err);
      res.render('events/edit');
    }
    else {
      console.log(req.body.event);
      res.redirect(show_page);
    }
  });
});



//DESTROY AN EVENT
app.delete('/events/:id',routeMiddleware.ensureLoggedIn, function(req,res){
  db.Event.findById(req.params.id, function(err, event){
    if (err) {
      console.log(err)
      res.render('events/show');
    } else {
      event.remove();
      res.redirect('/events');
    }
  });
});


//LISTEN TO THE HEROKU APP
// app.listen(process.env.PORT || 3000);

//SERVER
app.listen(process.env.PORT || 3000);



function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/calendar')
}