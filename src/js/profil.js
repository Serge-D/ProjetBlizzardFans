"use strict"


var ioClient;

// DECLARATIONS DES VAR POUR AFFICHAGE DU PROFIL

var pseudoP = window.document.getElementById("profilPseudo");
var nomP = window.document.getElementById("profilNom");
var prenomP = window.document.getElementById("profilPseudo");
var genreP = window.document.getElementById("profilGenre");
var mailP = window.document.getElementById("profilMail");
var preferenceP = window.document.getElementById("profilPreference");

window.addEventListener("DOMContentLoaded", function(){

    ioClient = io("https://blizzardfans.herokuapp.com/",{reconnection: true});

    ioClient.on("connect",function(){
        console.log("Connecté au serveur");


        var affichageProfil = function(infosUser){
            pseudoP.innerHTML = user.pseudo;
            nomP.innerHTML = user.nom;
            prenomP.innerHTML =userl.prenom;
            genreP.innerHTML = user.genre;
            mailP.innerHTML = user.mail;
            preferenceP.innerHTML = user.preference;
        };
        


        ioClient.on("infosUser",function(user){
            console.log(user);
            affichageProgil(user)
        })


        /******************* messages client *******************************/
        // webSocket.addEventListener("message", function(event) {
        //     var chatData = JSON.parse(event.data);
        //     console.log(chatData);
        //     var HTMLDivElement = window.document.getElementById("messages");
        //     HTMLDivElement.innerHTML +=
        //       "<p><b>" +
        //       chatData.nickname +
        //       "</b> dit : <i>" +
        //       chatData.message +
        //       "</i></p>";
        //     });
        //     // Emission des données du formulaire en cas de soumission
        //     HTMLFormElement.addEventListener("submit", function(event) {
        //       var HTMLInputElement = window.document.getElementsByName(
        //         "nickname"
        //       )[0];
        //       var HTMLTextareaElement = window.document.getElementsByName(
        //         "message"
        //       )[0];
        //       var chatData = {
        //         nickname: HTMLInputElement.value,
        //         message: HTMLTextareaElement.value
        //       };
        //       var chatDataAsString = JSON.stringify(chatData);
        //       webSocket.send(chatDataAsString);
        //     });
        //   });
        // });

    })



})