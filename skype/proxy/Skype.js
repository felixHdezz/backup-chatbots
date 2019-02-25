const gdistance = require('gps-distance');
const mongoUrl = 'url';
const MongoClient = require('mongodb').MongoClient;

var restify = require('restify');
var builder = require('botbuilder');
var fs = require('fs');
var config = require('./config.js');
var assert = require('assert');
var debug = true;
var vars = {
    sessions: {}
};
var queue = [];
var dbGlob = null;
var channelId = "";
var lastMsgId = {};
var bot = null;
try {
    var callerId = require('caller-id');
} catch (err) {
    debugPrint(null, 'caller-id was not present');
    callerId = null;
}

function init() {
    
    //connected to mongodb
    //MongoClient.connect(mongoUrl, function (err, db) {
        //dbGlob = db;
        //debugPrint(null,'Connected to mongo');
    //});
	

    var server = restify.createServer();
    server.listen(process.env.port || process.env.PORT || 443, function () {
        debugPrint(null,'listening to '+server.name+" "+server.url);
    });
    
    var connector = new builder.ChatConnector(config);
    
    bot = new builder.UniversalBot(connector);
    
    server.post('/api/messages', connector.listen());
    
    bot.on('conversationUpdate', function(message){
        
    });
    
    bot.on('contactRelationUpdate', function(message){});
    
    bot.dialog('/', getInitConersation);
    
    bot.beginDialogAction('hola','menu');
    debugPrint(null,"Running server...");
}

function getInitConersation(event) {
    InitConversationSkype(event);
}

function getProxy(context, event, callback) {
    try {
        var message = event.message.text;
   
	       if (message.toLowerCase().startsWith('proxy ')) {
            message = message.split(' ');
            context.simpledb.roomleveldata.proxy = message[1];
        }
        callback(context.simpledb.roomleveldata.proxy);
    } catch (e) {
        console.log(e);
    }
}

function getConectclient(Namefile) {
    try {
        eval(fs.readFileSync('../clients/'+Namefile+'/code.js') + '');
        this.SkypeMessages = SkypeMessages;
        this.bot = bot;
    } catch (e) {
        console.log(e);
    }
}

function getSession(context, event, callback) {
    getProxy(context, event, function (result) {
        var userid = event.message.user.id.toString().split(':')[1];
        vars.sessions[userid] = new getConectclient(result);
        callback(vars.sessions[userid])
    });
}

function getInitMessageConversation(event, collback) {
    try {
        var context = new Context(event);
        context.init(function () {
            getSession(context, event, function (session) {
                collback(context, event, session);
            });
        });
    } catch (e) {
        console.log(e);
    }
}

function InitConversationSkype(event) {
    try {
        getInitMessageConversation(event, function (context, event, session) {
            session.SkypeMessages(context, event);
        });
    } catch (e) {

    }
}

function Context(event) {
    var UserId = event.message.user.id.toString().split(':')[1];
    this.event = event;
    this.bots = bot;
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
        getCurrentData(UserId, UserId, function (records) {
            context.simpledb.roomleveldata = new Proxy(records.room.data, context.getSet(UserId));
            //            context.simpledb.botleveldata = new Proxy(records.bot.data, context.getSet(UserId));
            //            context.simpledb.globalleveldata = new Proxy(records.global.data, context.getSet('all'));
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
    dbGlob.collection('namedb').findOne({
        '_id': channelId
    }, function (err, result) {
        if (result) {
            callback(result);
        } else {
            var record = {
                _id: channelId,
                data: {}
            };
            dbGlob.collection('namedb').save(record, function (err, result) {
                callback(record);
            });
        }
    });
}

// TODO: unused parameter prop
function setChannelData(channelId, data, prop, callback) {
    // It looks like (the empty) callback is being called upto 3 times:
    // Once with original data if the channelId already existed
    // Once with new data (in parameter) regardless if it was saved/updated correctly
    // Once with either the original data or the new data, depending
    // on whether the object was correctly saved/updated
    dbGlob.collection('namedb').findOne({
        '_id': channelId
    }, function (err, result) {
        if (result) {
            callback(result);
            // TODO: unused variable
            var dataExist = result.data[prop];
        }
    });
    dbGlob.collection('NAMEDB').save({
        '_id': channelId,
        'data': data
    }, function (err, result) {
        callback(result);
        dbGlob.collection('NAMEDB').findOne({
            '_id': channelId
        }, function (err, result) {
            if (result) {
                callback(result);
                // TODO: unused variable
                var dataSaved = result.data[prop];
            }
        });

    });
}

function debugPrint(err, message) {
    if (debug) {
        var msg = getTime();
        if (callerId) {
            if (callerId.getString()) {
                msg += callerId.getString() + ': ';
            } else {
                msg += 'anonymousFunction: ';
            }
        }
        if (err) {
            msg += 'Error occurred. ' + err;
        } else {
            msg += message
        }
        console.log(msg);
    }
}

function getTime() {
    var now = new Date();
    return '[' + now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds() + '] ';
}
init();
