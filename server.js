// server.js

// BASE SETUP
// =============================================================================
var mongoose   = require('mongoose');
mongoose.connect('mongodb://mermanabv-mw-api-2308972:27017/test');
var contents     = require('./app/models/content');

// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('./config'); // get our config file
var User   = require('./app/models/user'); // get our mongoose model

app.set('superSecret', config.secret); // secret variable

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// more routes for our API will happen here
router.route("/content")
    .get(function(req,res){
        var response = {};
        contents.find({},function(err,data){
        // Mongo command to fetch all data from collection.
            if(err) {
                response = {"error" : true,"message" : "Error fetching data"};
            } else {
                response = {"error" : false,"message" : data};
            }
            res.json(response);
        });
    });

router.route("/content/:contentId")
    .get(function(req,res){
        var response = {};
        var myContentId = req.params.contentId;
        //console.log(req.param('dateFrom'));
        contents.findOne({ 'content.contentId' : +myContentId },'-_id',function(err,data){
        // This will run Mongo Query to fetch data based on ID.
            if(err) {
                response = {"error" : true,"message" : "Error fetching data"};
            } else {
                response = data;
            }
            res.json(response);
        });
    })
    
router.route("/epg/:channelId")
    .get(function(req,res){
        var response = {};
        var mychannelId = req.params.channelId;
        var mydateFrom = req.param('dateFrom');
        var mydateTo = req.param('dateTo');
        var mysize = req.param('size');
        console.log(mychannelId);
        contents.find({
            $and: [
                {"content.channelId" : +mychannelId},
                {"content.startDateTime" : { $lte: +mydateTo}},
                {"content.startDateTime" : { $gte: +mydateFrom}}
                ] 
        })
        .select( '-content.description -_id' )
        .limit(mysize)
        .exec(function(err,data){
                if(err) { 
                response = {"error" : true,"message" : "Error fetching data"};
                } else {
                 //response = data;
                 /*var contents = [];
                    var i = 0;
                    data.forEach(function (doc) {
                        contents[i] = doc;
                        i++;
                    });
                    response = { "contents" : contents }; */
                    response = { "contents" : data };
                }
                res.json(response);
        });
    });
//Insert Mock data for a single customer account
router.get('/setup', function(req, res) {
      console.log("in setup");
  // create a sample user
  var nick = new User({ 
    name: 'Nick Cerminara', 
    password: 'password',
    admin: true 
  });

  // save the sample user
  nick.save(function(err) {
    if (err) throw err;

    console.log('User saved successfully');
    res.json({ success: true });
  });  
});

//Authorisation - First step for using the API
router.post('/auth', function(req, res) {

  // find the user
  User.findOne({
    name: req.body.name
  }, function(err, user) {
    console.log(req.body.password);
    if (err) throw err;

    if (!user) {
      res.json({ success: false, message: 'Authentication failed. User not found.' });
    } else if (user) {

      // check if password matches
      if (user.password != req.body.password) {
        res.json({ success: false, message: 'Authentication failed. Wrong password.' });
      } else {

        // if user is found and password is right
        // create a token
        var token = jwt.sign({ name: user.name }, app.get('superSecret'), {
          expiresIn: 300 // expires in seconds
        });

        // return the information including token as JSON
        res.json({
          success: true,
          message: 'Enjoy your token!',
          token: token
        });
      }   

    }

  });
});

router.use(function(req, res, next) {

  // check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token || req.headers['x-access-token'];

  // decode token
  if (token) {

    // verifies secret and checks exp
    jwt.verify(token, app.get('superSecret'), function(err, decoded) {      
      if (err) {
        return res.json({ success: false, message: 'Failed to authenticate token.' });    
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;    
        next();
      }
    });

  } else {

    // if there is no token
    // return an error
    return res.status(403).send({ 
        success: false, 
        message: 'No token provided.' 
    });
    
  }
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api) - hopefully protected route
router.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to our api!' }); 
    console.log("Customer %s is accessing the API with token", req.decoded.name);
});

// REGISTER TOKEN PROTECTED ROUTES -------------------------------



// all of our routes will be prefixed with /api
app.use('/xtv-ws-client/api', router);

// START THE SERVER
app.listen(process.env.PORT, process.env.IP);
console.log('Magic happens on port ' + process.env.PORT);