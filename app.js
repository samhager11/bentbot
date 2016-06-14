var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var https = require('https');
var http = require('http');
var app = express();


//The dashbot Bot keyword
var dashbotKey = "9BVrZGBcXPWExJnLysWBK3DE7Z1SDJ3AGX9HfG74"

//Initializing dashbot.io
var dashbot = require('dashbot')(dashbotKey).facebook;

//Facebook validation token (created by me)
var fbValidationToken = 'super-secret'

//Facebook page token required to send messages back to user
var fbPageToken = "EAAZADlDyRPIABAAtgaOV6gaJwN6VskqFg1ZCtMEUh331N54fIRU02zYe9Ynd1etYhb6hgsZB7cY1STBOJZBLvmuEVGMQA0GHh2MGBlxF0QOSDDICwz1rhlHi98IVvn4PIPA0GjGIXtqODWriKyGlMm51ZB88t0Wpctwb0gzeAkwZDZD"

//Set server
app.set('port', (process.env.PORT || 3000))

//Test - root of app
app.get('/hello', function(req, res){
  res.send('hello! world!')
})

//parse application json
app.use(bodyParser.json());


//Handle the bot validation step from Facebook - FB will send the validation token created to validate the bot
//To verify the token
app.get('/webhook', function (req, res) {
  //should store validation token in variable later
  if (req.query['hub.verify_token'] === fbValidationToken) {
    res.send(req.query['hub.challenge']);
  } else {
    res.send('Error, wrong validation token');
  }
});

//Should do the things we want to do
app.post('/webhook/', function(req, res){
  //entry is part of the callback object that is being returned to webhook
  messaging_events = req.body.entry[0].messaging;

  //Log incoming messages to dashbot.io
  dashbot.logIncoming(req.body);


  for(i = 0; i < messaging_events.length; i++) {
    event = req.body.entry[0].messaging[i];
    //logging whole callback to see what it looks like
    console.log("This is the request body in the for loop: " + event)

    //set the sender to the id received so we can respond to the right person with a message back
    sender = event.sender.id;
    if(event.message && event.message.text){
      text = event.message.text;
      //Handle a text message from this sender
      console.log("User typed: " + text);
      sendTextMessage(sender, "Text received, echo: "+ text.substring(0,200));
    }
  }
  res.sendStatus(200);
})




function sendTextMessage(sender, text){
  messageData = {
    text:text
  }
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token:fbPageToken},
    method: 'POST',
    json: {
      recipient: {id:sender},
      message: messageData,
    }
  }, function(error, response, body){
    //log response received by webhook to dashbot.io
    dashbot.logOutgoingResponse(requestId, error, response)
    console.log("The response received being sent to dashbot: " + requestId + " - requestId, " + response + " - response")

    if(error){
      console.log('Error sending message: ', error);
    }
      else if (response.body.error) {
        console.log('Error: ', response.body.error)
      }
  });

  //log outgoing message to dashbot.io
  requestId = dashbot.logOutgoing(request)
  console.log("The requestId going to dashbot: " + requestId)

}

//Spin up server
app.listen(app.get('port'), function() {
  console.log('running on port ', app.get('port'))
})

//app.listen(process.env.PORT || 3000)

// //Enable bot to listen on http and https
// http.createServer(app).listen(80);
// https.createServer(app).listen(443)
