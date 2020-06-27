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

    ioClient = io("",{reconnection: true});

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
        })


    })



})