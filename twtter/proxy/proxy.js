var twit = require('twit');
var config = require('./config.js');
var express = require('express');
var request = require('request');
var fs = require('fs');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const Server = require('mongodb').Server;
const Db = require('mongodb').Db;
const gdistance = require('gps-distance');
const ReplSetServers = require('mongodb').ReplSetServers,
    ObjectID = require('mongodb').ObjectID,
    Binary = require('mongodb').Binary,
    GridStore = require('mongodb').GridStore,
    Grid = require('mongodb').Grid,
    Code = require('mongodb').Code;
const mongoUrl = 'url dbMongo';
var app = new express();
var T = new twit(config);
var vars = {
    sessions: {}
};
var queue = [];
var dbGlob = null;
var channelId = "";
var lastMsgId = {};

// Every so often pick a random one from the queue and tweet it once per hour
function init() {
    MongoClient.connect(mongoUrl, function (err, db) {
        dbGlob = db;
    });
    var stream1 = T.stream('statuses/filter', {
        track: 'tweets_ybot'
    });
    var stream = T.stream('user');
    stream1.on('tweet', gotTweet);
    stream.on('direct_message', getMsgdirect);
    console.log('server run...');
}

function tweetIt() {
    // Make sure there is something
    if (queue.length > 0) {
        var index = Math.floor(Math.random() * queue.length);
        var tweetID = queue[index];
        //console.log('attempting to retweet: ' + tweetID);
        queue = [];
        T.post('statuses/retweet', {
            id: tweetID
        }, retweeted);

        function retweeted(err, data, response) {
            if (err) {
                console.log("Error: " + err.message);
            } else {
                console.log('Retweeted: ' + tweetID);
            }
        }
    } else {
        //console.log('No tweets to retweet.');
    }
}

function gotTweet(eventMsg) {
    Messagestweet(eventMsg);
}

function getMsgdirect(eventMsg) {
    if (eventMsg.direct_message.text !== "" || eventMsg.direct_message.text !== nul) {
        MessagesDirect(eventMsg);
    }
}

function getProxy(context, event, callback) {
    try {
        var message = context.event.text.toLowerCase();
        if (message.startsWith('proxy ')) {
            message = message.split(' ');
            context.simpledb.roomleveldata.proxy = message[1];
        }
        callback(context.simpledb.roomleveldata.proxy);
    } catch (e) {
    }
}

function getConectclient(Namefile) {
    try {
        eval(fs.readFileSync('../clients/' + Namefile + '/code.js') + '');
        this.MessageDirect = MessageDirect;
        this.MessageTweet = MessageTweet;
    } catch (e) {
        //console.log('Error no se pudo cargar el archivo');
    }
}

function getSession(context, event, callback) {
    getProxy(context, event, function (result) {
        try {
            var userid = event.direct_message.sender.id;
        } catch (e) {
            var userid = event.user.id;
        }
        vars.sessions[userid] = new getConectclient(result);
        callback(vars.sessions[userid])
    });
}

function getInitMessageDirect(event, collback) {
    var contexts = new context(event);
    contexts.init(function () {
        getSession(contexts, event, function (session) {
            collback(contexts, event, session);
        });
    });
}

function getInitTweets(event, collback) {
    var contexts = new contextTweet(event);
    contexts.init(function () {
        getSession(contexts, event, function (session) {
            collback(contexts, event, session);
        });
    });
}

function MessagesDirect(event) {
    try {
        getInitMessageDirect(event, function (context, event, session) {
            session.MessageDirect(context, event);
        });
    } catch (e) {

    }
}

function Messagestweet(event) {
    try {
        getInitTweets(event, function (context, event, session) {
            session.MessageTweet(context, event);
        });
    } catch (e) {
    }
}

function contextTweet(event) {
    this.event = event;
    this.sendResponse = getSendResponsetweets;
    this.queue = queue;
    this.simplehttp = {
        parent: this
    };
    this.simpledb = {
        roomleveldata: {},
        botleveldata: {},
        globalleveldata: {},
        parent: this
    };
    var context = this;
    this.getSet = function (channelId) {
        return {
            set: function (obj, prop, value, receiver) {
                obj[prop] = value;
                setChannelData(channelId, obj, prop, function (result) {});
                return true;
            }
        };
    };
    this.init = function (callback) {
        getCurrentData(event.user.id, event.user.id, function (records) {
            context.simpledb.roomleveldata = new Proxy(records.room.data, context.getSet(event.user.id));
            context.simpledb.botleveldata = new Proxy(records.bot.data, context.getSet(event.user.id));
            context.simpledb.globalleveldata = new Proxy(records.global.data, context.getSet('all'));
            callback();
        });
    };
}

function context(event) {
    this.event = event.direct_message;
    this.sendResponse = getSendResponsetweets;
    this.sendResponseMsgDirec = getSendResponseMgsDirect;
    this.simplehttp = {
        parent: this
    };
    this.simpledb = {
        roomleveldata: {},
        botleveldata: {},
        globalleveldata: {},
        parent: this
    };
    var context = this;
    this.getSet = function (channelId) {
        return {
            set: function (obj, prop, value, receiver) {
                obj[prop] = value;
                setChannelData(channelId, obj, prop, function (result) {});
                return true;
            }
        };
    };
    this.init = function (callback) {
        getCurrentData(event.direct_message.sender.id, event.direct_message.sender.id, function (records) {
            context.simpledb.roomleveldata = new Proxy(records.room.data, context.getSet(event.direct_message.sender.id));
            context.simpledb.botleveldata = new Proxy(records.bot.data, context.getSet(event.direct_message.sender.id));
            context.simpledb.globalleveldata = new Proxy(records.global.data, context.getSet('all'));
            callback();
        });
    };
}

function getCurrentData(room, bot, callback) {
    getChannelData('all', function (globalData) {
        getChannelData(bot, function (botData) {
            getChannelData(room, function (roomData) {
                callback({
                    global: globalData,
                    room: roomData,
                    bot: botData
                });
            });
        });
    });
}

function getChannelData(channelId, callback) {
    dbGlob.collection('ybot').findOne({
        '_id': channelId
    }, function (err, result) {
        if (result) {
            callback(result);
        } else {
            var record = {
                _id: channelId,
                data: {}
            };
            dbGlob.collection('ybot').save(record, function (err, result) {
                callback(record);
            });
        }
    });
}

function setChannelData(channelId, data, prop, callback) {
    dbGlob.collection('ybot').findOne({
        '_id': channelId
    }, function (err, result) {
        if (result) {
            callback(result);
            var dataExist = result.data[prop];
        }
    });
    dbGlob.collection('ybot').save({
        '_id': channelId,
        'data': data
    }, function (err, result) {
        callback(result);
        dbGlob.collection('ybot').findOne({
            '_id': channelId
        }, function (err, result) {
            if (result) {
                callback(result);
                var dataSaved = result.data[prop];
            }
        });

    });
}

function getSendResponsetweets(txt) {
    var tweet = {
        status: txt
    };
    T.post('statuses/update', tweet, tweeted);

    function tweeted(err, data, response) {
        if (err) {
            console.log(err);
        } else {
            console.log('Message sent...');
        }
    }
}

function getSendResponseMgsDirect(json) {
    var data = {
        user_id: json.user_id,
        screen_name: json.screen_name,
        text: json.text
    };
    T.post('direct_messages/new', data, function (res) {
        console.log('Data sent...');
    });
}
init();
setInterval(tweetIt, 60 * 100);
