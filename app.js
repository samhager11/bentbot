var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var request = require('request');
var https = require('https');
var http = require('http');

//Test
app.get('/hello', function(req, res){
  res.send('hello! world!')
})

//parse application json
app.use(bodyParser.json());

//To verify the token
app.get('/webhook', function (req, res) {
  if (req.query['hub.verify_token'] === 'super-secret') {
    res.send(req.query['hub.challenge']);
  } else {
    res.send('Error, wrong validation token');
  }
});

//Should do the things we want to do
app.post('/webhook/', function(req, res){
  messaging_events = req.body.entry[0].messaging;
  for(i = 0; i < messaging_events.length; i++) {
    event = req.body.entry[0].messaging[i];
    sender = event.sender.id;
    if(event.message && event.message.text){
      text = event.message.text;
      //Handle a text message from this sender
      console.log(text);
      sendTextMessage(sender, "Text received, echo: "+ text.substring(0,200));
    }
  }
  res.sendStatus(200);
})


var token = "EAAZADlDyRPIABAAtgaOV6gaJwN6VskqFg1ZCtMEUh331N54fIRU02zYe9Ynd1etYhb6hgsZB7cY1STBOJZBLvmuEVGMQA0GHh2MGBlxF0QOSDDICwz1rhlHi98IVvn4PIPA0GjGIXtqODWriKyGlMm51ZB88t0Wpctwb0gzeAkwZDZD"

function sendTextMessage(sender, text){
  messageData = {
    text:text
  }
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token:token},
    method: 'POST',
    json: {
      recipient: {id:sender},
      message: messageData,
    }
  }, function(error, response, body){
    if(error){
      console.log('Error sending message: ', error);
    }
      else if (response.body.error) {
        console.log('Error: ', response.body.error)
      }
  });
}

app.listen(process.env.PORT || 3000)
