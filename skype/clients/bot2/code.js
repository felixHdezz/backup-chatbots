function SkypeMessages(context, event) {
    handlers.context = context;
    handlers.event = event;
    var message = context.event.message;
    if (message.type === "message") {
        if (message.text !== "") {
            var msg = message.text;
            //console.log(msg);
            if(msg.startsWith('proxy') || msg.toLowerCase()== "hola" || msg.toLowerCase()== "menu") {
                handlers.showMenu();
            } else if(msg.toLowerCase() === "card"){
                var card = new builder.HeroCard(context.event)
                    .title("Microsoft Bot Framework")
                    .text("Un bot es un programa informático, imitando el comportamiento de un ... Es por ello que, aquellos sitios que hacen un uso positivo de los bots, como Wikipedia o Encarta, tienen reglas muy estrictas para su uso.")
                    .images([
                             builder.CardImage.create(context.event, "http://static.blastingnews.com/media/photogallery/2016/10/15/main/dbs-la-fusion-de-goku-y-vegeta-se-dara-en-el-capitulo-66-vegetto-o-gogeta_921841.jpg")
                        ]);
                var msg = new builder.Message(context.event).attachments([card]);
                context.event.send(msg);
                context.event.send('Es es una prueba de envio de messages de texto normal :)');
            } else if(msg.toLowerCase() === 'list'){
                handlers.showList();
            } else if(msg.toLowerCase() === 'receipt'){
                handlers.showReceipt();
            } else if(msg.toLowerCase() === 'picture'){
                handlers.showPicture();
            } else if(msg.toLowerCase() === 'singin'){
                handlers.showExampleSignin();
            } else if(msg.toLowerCase() === 'buttons'){
                handlers.showButton();
            }else{
                context.event.send("Lo siento mucho "+message.user.name.split(' ')[0]+", no ententí tu mensaje :(.");
            }
        }
    }
}

var handlers = {
    showMenu : function(){
        var userName = handlers.context.event.message.user.name;
        //Mensaje de inicio de la conversacion.
        handlers.context.event.send("Hola "+userName+"! Bienvenido a Skype, yo soy un bot de mensajeria puedes enviarme mensajes y te contestaria lo mas rapido que pueda.\n\n¿Cómo puedo ayudarte? :)");
         var msg = new builder.Message(handlers.context.event)
         .textFormat(builder.TextFormat.xml)
            .attachmentLayout(builder.AttachmentLayout.carousel)
            .attachments([
                new builder.HeroCard(handlers.context.event)
                    .title("Space Needle")
                    .text("The <b>Space Needle</b> is an observation tower in Seattle, Washington, a landmark of the Pacific Northwest, and an icon of Seattle.")
                    .images([
                        builder.CardImage.create(handlers.context.event, "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Seattlenighttimequeenanne.jpg/320px-Seattlenighttimequeenanne.jpg")
                            .tap(builder.CardAction.showImage(handlers.context.event, "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Seattlenighttimequeenanne.jpg/800px-Seattlenighttimequeenanne.jpg")),
                    ])
                    .buttons([
                        builder.CardAction.openUrl(handlers.context.event, "https://en.wikipedia.org/wiki/Space_Needle", "Wikipedia"),
                        builder.CardAction.imBack(handlers.context.event, "select:100", "Select")
                    ]),
                new builder.HeroCard(handlers.context.event)
                    .title("Pikes Place Market")
                    .text("<b>Pike Place Market</b> is a public market overlooking the Elliott Bay waterfront in Seattle, Washington, United States.")
                    .images([
                        builder.CardImage.create(handlers.context.event, "https://upload.wikimedia.org/wikipedia/en/thumb/2/2a/PikePlaceMarket.jpg/320px-PikePlaceMarket.jpg")
                            .tap(builder.CardAction.showImage(handlers.context.event, "https://upload.wikimedia.org/wikipedia/en/thumb/2/2a/PikePlaceMarket.jpg/800px-PikePlaceMarket.jpg")),
                    ])
                    .buttons([
                        builder.CardAction.openUrl(handlers.context.event, "https://en.wikipedia.org/wiki/Pike_Place_Market", "Wikipedia"),
                        builder.CardAction.imBack(handlers.context.event, "select:101", "Select")
                    ]),
                new builder.HeroCard(handlers.context.event)
                    .title("EMP Museum")
                    .text("<b>EMP Musem</b> is a leading-edge nonprofit museum, dedicated to the ideas and risk-taking that fuel contemporary popular culture.")
                    .images([
                        builder.CardImage.create(handlers.context.event, "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Night_Exterior_EMP.jpg/320px-Night_Exterior_EMP.jpg")
                            .tap(builder.CardAction.showImage(handlers.context.event, "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Night_Exterior_EMP.jpg/800px-Night_Exterior_EMP.jpg"))
                    ])
                    .buttons([
                        builder.CardAction.openUrl(handlers.context.event, "https://en.wikipedia.org/wiki/EMP_Museum", "Wikipedia"),
                        builder.CardAction.imBack(handlers.context.event, "select:102", "Select")
                    ])
            ]);
        handlers.context.event.send(msg);
    },
    showList : function(){
        handlers.context.event.send("You can send the user a list of cards as multiple attachments in a single message...");

        var msg = new builder.Message(handlers.context.event)
            .textFormat(builder.TextFormat.xml)
            .attachments([
                new builder.HeroCard(handlers.context.event)
                    .title("Hero Card")
                    .subtitle("Space Needle")
                    .text("The <b>Space Needle</b> is an observation tower in Seattle, Washington, a landmark of the Pacific Northwest, and an icon of Seattle.")
                    .images([
                        builder.CardImage.create(handlers.context.event, "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Seattlenighttimequeenanne.jpg/320px-Seattlenighttimequeenanne.jpg")
                    ]),
                new builder.ThumbnailCard(handlers.context.event)
                    .title("Thumbnail Card")
                    .subtitle("Pikes Place Market")
                    .text("<b>Pike Place Market</b> is a public market overlooking the Elliott Bay waterfront in Seattle, Washington, United States.")
                    .images([
                        builder.CardImage.create(handlers.context.event, "https://upload.wikimedia.org/wikipedia/en/thumb/2/2a/PikePlaceMarket.jpg/320px-PikePlaceMarket.jpg")
                    ])
            ]);
        handlers.context.event.endDialog(msg);
    },
    showReceipt : function(){
        handlers.context.event.send("You can send a receipts for purchased good with both images and without...");
        
        // Send a receipt with images
        var msg = new builder.Message(handlers.context.event)
            .attachments([
                new builder.ReceiptCard(handlers.context.event)
                    .title("Recipient's Name")
                    .items([
                        builder.ReceiptItem.create(handlers.context.event, "$22.00", "EMP Museum").image(builder.CardImage.create(handlers.context.event, "https://upload.wikimedia.org/wikipedia/commons/a/a0/Night_Exterior_EMP.jpg")),
                        builder.ReceiptItem.create(handlers.context.event, "$22.00", "Space Needle").image(builder.CardImage.create(handlers.context.event, "https://upload.wikimedia.org/wikipedia/commons/7/7c/Seattlenighttimequeenanne.jpg"))
                    ])
                    .facts([
                        builder.Fact.create(handlers.context.event, "1234567898", "Order Number"),
                        builder.Fact.create(handlers.context.event, "VISA 4076", "Payment Method"),
                        builder.Fact.create(handlers.context.event, "WILLCALL", "Delivery Method")
                    ])
                    .tax("$4.40")
                    .total("$48.40")
            ]);
        handlers.context.event.send(msg);

        // Send a receipt without images
        msg = new builder.Message(handlers.context.event)
            .attachments([
                new builder.ReceiptCard(handlers.context.event)
                    .title("Recipient's Name")
                    .items([
                        builder.ReceiptItem.create(handlers.context.event, "$22.00", "EMP Museum"),
                        builder.ReceiptItem.create(handlers.context.event, "$22.00", "Space Needle")
                    ])
                    .facts([
                        builder.Fact.create(handlers.context.event, "1234567898", "Order Number"),
                        builder.Fact.create(handlers.context.event, "VISA 4076", "Payment Method"),
                        builder.Fact.create(handlers.context.event, "WILLCALL", "Delivery Method")
                    ])
                    .tax("$4.40")
                    .total("$48.40")
            ]);
        handlers.context.event.endDialog(msg);
    },
    showPicture : function(){
        handlers.context.event.send("You can easily send pictures to a user...");
        var msg = new builder.Message(handlers.context.event)
            .attachments([{
                contentType: "image/jpeg",
                contentUrl: "http://www.theoldrobots.com/images62/Bender-18.JPG"
            }]);
        handlers.context.event.endDialog(msg);
    },
    showExampleSignin : function(){
        var msg = new builder.Message(handlers.context.event) 
            .attachments([ 
                new builder.SigninCard(handlers.context.event) 
                    .text("You must first signin to your account.") 
                    .button("signin", "https://www.facebook.com/") 
            ]); 
        handlers.context.event.endDialog(msg); 
    },
    showButton : function() {
        var style = builder.ListStyle['button'];
        builder.Prompts.choice(handlers.context.event, "Ejemplo de botones en Skype.\n\nSelecciona una opcion!", "option A|option B|option C", { listStyle: style });
    }
}
