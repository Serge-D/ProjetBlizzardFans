"use strict"

// Fonction pour verifier si les champs du formulaire inscription sont vides

window.addEventListener("DOMContentLoaded", function(){

    ioClient = io("",{reconnection: true});

    ioClient.on("connect",function(){

        ioClient.emit("login", function(){
            //envoi de message serveur
        })

        ioClient.on("", function(){
            //recoit des messages serveur
        })

    })

})    