const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser')
const logger = require('morgan');
const http = require('http');
const mongo = require('mongodb');
mongoClient = mongo.MongoClient;
const dbConnection = process.env.DB_CONNECTION_STRING;
const app = express();
//api routes
const apiRoutes  = require('./routes/api')
const port = process.env.PORT || 3000;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser());
app.use(express.static(path.join(__dirname, 'public')));

//database connection
mongoClient.connect(dbConnection)
.then(client => {

const db = client.db('nasa_neo')

  app.use('/api', apiRoutes(db))

  var server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */
  server.listen(port);
})
.catch(err=>{
  console.log("Error While Conntecting to Database",err);
})


