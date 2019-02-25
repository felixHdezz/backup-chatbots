var API_URL = 'https://api.api.ai/api/query';
var SESSION_ID = '8bdb152d-55e1-4a85-b671-7c8216eb3653';
function MessageDirect(context, event) {
    if (context.event.text) {
        var text = context.event.text;
        var user_id = context.event.sender.id;
        var screen_name = context.event.sender.screen_name;
        get_ApiCall(text, SESSION_ID, function (result) {
            if (screen_name !== "tweets_ybot") {
                var data = {
                    user_id: user_id,
                    screen_name: screen_name,
                    text: result
                };
                context.sendResponseMsgDirec(data);
            }
        });
    }
}

function MessageTweet(context, event) {
    var rand = Math.floor(Math.random() * 100);
    var replyto = context.event.in_reply_to_screen_name;
    var text = context.event.text;
    var name_tweet = context.event.user.screen_name;
    if (replyto === "tweets_ybot") {
        context.sendResponse("@" + name_tweet + " gracias por tu twett :) " + rand + " #");
        context.queue.push(context.event.id_str);
    }
}

function get_ApiCall(MESSEGES, SESSION_ID, callback) {
    try {
        var options = {
            method: 'GET',
            url: 'https://api.api.ai/api/query',
            qs: {
                v: '20150910',
                query: MESSEGES,
                lang: 'es',
                sessionId: '8bdb152d-55e1-4a85-b671-7c8216eb3653'
            },
            headers: {
                authorization: 'Bearer 03388ca6cc5943209befd7af14c16dad'
            }
        };
        request(options, function (error, response, body) {
            if (error) {
                console.log(error);
            } else {
                var result = JSON.parse(body);
                callback(result.result.fulfillment.speech);
            }
        });
    } catch (e) {
        console.log("Error");
    }
}
