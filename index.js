'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()
const token = process.env.FB_PAGE_ACCESS_TOKEN

app.set('port', (process.env.PORT || 5000))

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// Process application/json
app.use(bodyParser.json())

// Index route
app.get('/', function (req, res) {
    res.send('Hello world, I am a chat bot')
})

// for Facebook verification
app.get('/webhook/', function (req, res) {
    if (req.query['hub.verify_token'] === 'my_voice_is_my_password_verify_me') {
        res.send(req.query['hub.challenge'])
    }
    res.send('Error, wrong token')
})

var senderid;
var rmp = require("rmp-api");
 
var callback = function(professor) {
  if (professor === null) {
    console.log("No professor found.");
    return;
  }
  //sendTextMessage(senderid, "Review: " + JSON.stringify(professor))
  sendTextMessage("Name: " + professor.fname + " " + professor.lname);
  sendTextMessage("University: "+ professor.university);
  sendTextMessage("Quality: " + professor.quality);
  sendTextMessage("Easiness: " + professor.easiness);
  sendTextMessage("Helpfulness: " + professor.help);
  sendTextMessage("Average Grade: " + professor.grade);
  sendTextMessage("Chili: " + professor.chili);
  sendTextMessage("URL: " + professor.url);
  sendTextMessage("First comment: " + professor.comments[0]);
};


function sendGenericMessage(sender) {
    let messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": "Ask about Professor",
                    "subtitle": "Professor Review",
                    "buttons": [{
                        "type": "postback",
                        "title": "Professor",
                        "payload": "Type in Professor's Full Name",
                    }],
                }, {
                    "title": "Ask about University",
                    "subtitle": "University Review",
                    "buttons": [{
                        "type": "postback",
                        "title": "University",
                        "payload": "Type in University",
                    }],
                }]
            }
        }
    }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}

function sendTextMessage(sender, text) {
    let messageData = { text:text }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}

function review(name){
	rmp.get("Paul Lynch", callback)
}


app.post('/webhook/', function (req, res) {
    let messaging_events = req.body.entry[0].messaging
    for (let i = 0; i < messaging_events.length; i++) {
      let event = req.body.entry[0].messaging[i]
      let sender = event.sender.id
      senderid = sender;
      if (event.message && event.message.text) {
        let text = event.message.text
        if (text.toUpperCase() === 'HI' || text.toUpperCase() == 'Hey') {
            sendGenericMessage(sender)
            continue
        }
        review(text)
        //sendTextMessage(sender, "Review: " + JSON.stringify(rmp.get("Paul Lynch", callback)))
      }
      if (event.postback) {
        let text = JSON.stringify(event.postback)
        sendTextMessage(sender, "Postback received: "+event.postback['payload'].substring(0, 200), token)
        continue
      }
    }
    res.sendStatus(200)
  })


// Spin up the server
app.listen(app.get('port'), function() {
    console.log('running on port', app.get('port'))
})