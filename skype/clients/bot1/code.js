function SkypeMessages(context, event) {
    var data = context.event.message;
    //console.log(data);
    if (data.type === "message") {
        if (data.text !== "") {
            var message = data.text;
            if (message.startsWith('proxy')) {
                context.event.send("Hi "+data.user.name+"... I'm the bot for Skype. I can show you everything you can use our Bot Builder SDK to do on Skype.");
            }else{
                var card = new builder.HeroCard(context.event)
                    .title("Microsoft Bot Framework")
                    .text("Your bots - wherever your users are talking.")
                    .images([
                             builder.CardImage.create(context.event, "http://docs.botframework.com/images/demo_bot_image.png")
                        ]);
                var msg = new builder.Message(context.event).attachments([card]);
                context.event.send(msg);
                //context.event.beginDialog('/help');
            }
        }
    }
}
