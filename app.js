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
app.get('/', function(req,res){
  res.render('users/index');
});




//SERVER
app.listen(3000, function(){
  console.log("Server is listening on port 3000");
});