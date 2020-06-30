"use strict"

window.addEventListener("DOMContentLoaded", function(){

    ioClient = io("https://blizzardfans.herokuapp.com/",{reconnection: true});

    ioClient.on("connect",function(){

        ioClient.emit("login", function(){
            //envoi de message serveur
        })

        ioClient.on("", function(){
            //recoit des messages serveur
        })

    })

})    