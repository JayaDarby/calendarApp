var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    morgan = require('morgan'),
    methodOverride = require('method-override'),
    session = require("cookie-session"),
    db = require('./models');
    loginMiddleware = require("./middleware/login");
    routeMiddleware = require("./middleware/route");

app.set('view engine', 'ejs');
app.use(morgan('tiny'));
app.use(methodOverride('_method'));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended: true}));

app.use(session({
  maxAge: 3600000,
  secret: 'lkjhgfdsa',
  name: "gibberish"
}));

app.use(loginMiddleware);

//ROOT
//renders the page that allows the user to either login or signup
app.get('/', function(req,res){
  res.render('users/index');
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
      res.redirect("/events");
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
//on the user.js page in models. if there isn't an error and the user
app.post("/login", function (req, res) {
  db.User.authenticate(req.body.user,
  function (err, user) {
    if (!err && user !== null) {
      req.login(user);
      res.redirect("/events");
    } else {
      // TODO - handle errors in ejs!
      res.render("users/login");
      res.send('invalid username or password');
    }
  });
});

app.get('/events', routeMiddleware.ensureLoggedIn, function(req,res){
      res.render("layout");
});



app.get("/logout", function (req, res) {
  req.logout();
  res.redirect("/");
});

app.get('*', function(req,res){
  res.render('errors/404');
});


//SERVER
app.listen(3000, function(){
  console.log("Server is listening on port 3000");
});