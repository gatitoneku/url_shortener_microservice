 /******************************************************
 * PLEASE DO NOT EDIT THIS FILE
 * the verification process may break
 * ***************************************************/

'use strict';

var fs = require('fs');
var express = require('express');
var app = express();
require('dotenv').config();
var MongoClient = require('mongodb').MongoClient;
const dburl = "mongodb://gatitoneku:1234@ds119044.mlab.com:19044/urlshortenermean"

if (!process.env.DISABLE_XORIGIN) {
  app.use(function(req, res, next) {
    var allowedOrigins = ['https://narrow-plane.gomix.me', 'https://www.freecodecamp.com'];
    var origin = req.headers.origin || '*';
    if(!process.env.XORIG_RESTRICT || allowedOrigins.indexOf(origin) > -1){
         console.log(origin);
         res.setHeader('Access-Control-Allow-Origin', origin);
         res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    }
    next();
  });
}

app.use('/public', express.static(process.cwd() + '/public'));

app.route('/_api/package.json')
  .get(function(req, res, next) {
    console.log('requested');
    fs.readFile(__dirname + '/package.json', function(err, data) {
      if(err) return next(err);
      res.type('txt').send(data.toString());
    });
  });
  
app.route('/')
    .get(function(req, res) {
		  res.sendFile(process.cwd() + '/views/index.html');
    })

var linkId = 62582;

app.route('/new/:link')
    .get(function(req, res){
    console.log(req.params.link);
    
    MongoClient.connect(dburl, function(err, db) {
    if (err) throw err;
    var coll = db.collection('links');
    var doc = {origURL:req.params.link, shortURL:linkId }
    coll.insert(doc, function(err, data){
        if (err) throw err;
        console.log();
        res.send("Your shortened link is http://sun-jury.glitch.me/"+data.ops[0].shortURL);
    })
   
    db.close();
    })
    linkId++;
})

app.route('/:shorturl')
    .get(function(req, res){
     var resultArray = [];
     MongoClient.connect(dburl, function(err, db){
            if (err) throw err;
            var coll = db.collection('links');
            var cursor = coll.find({
                shortURL: parseInt(req.params.shorturl)
            });
            //console.log(cursor);
            cursor.forEach(function(doc, err){
             if (err) throw err;
             resultArray.push(doc);
         }, function(){
             db.close();
             if(resultArray[0]!=null){
             console.log(resultArray[0].origURL);
             res.redirect("http://"+resultArray[0].origURL);}
             else{
             res.redirect('..')
             }
        })
      })     
    }) 


// Respond not found to all the wrong routes
app.use(function(req, res, next){
  res.status(404);
  res.type('txt').send('Not found');
});

// Error Middleware
app.use(function(err, req, res, next) {
  if(err) {
    res.status(err.status || 500)
      .type('txt')
      .send(err.message || 'SERVER ERROR');
  }  
})

app.listen(process.env.PORT, function () {
  console.log('Node.js listening ...');
  console.log(process.env.PORT);
  
});


