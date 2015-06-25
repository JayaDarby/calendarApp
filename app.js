var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    morgan = require('morgan'),
    methodOverride = require('method-override'),
    session = require("cookie-session"),
    db = require('./models');
    loginMiddleware = require("./middleware/loginHelper");
    routeMiddleware = require("./middleware/routeHelper");

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