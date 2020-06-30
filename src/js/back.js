"use strict"


var ioClient;

// DECLARATIONS DES VAR POUR AFFICHAGE DU PROFIL

var pseudoP = window.document.getElementById("profilPseudo");
var nomP = window.document.getElementById("profilNom");
var prenomP = window.document.getElementById("profilPseudo");
var genreP = window.document.getElementById("profilGenre");
var mailP = window.document.getElementById("profilMail");
var preferenceP = window.document.getElementById("profilPreference");

var rechercheUsers = window.document.getElementById("searchBar");
var resultatRechercheUsers = window.document.getElementById("resultatSearch");

var bouttonModifProfil = window.document.getElementById("btnModif");
var formModifProfil = window.document.getElementById("formModifProfil");
var bouttonAnnulModif = window.document.getElementById("annulModif");

var formChat = window.document.getElementById("formChat");
// formChat.addEventListener("submit", function(event){
//     event.preventDefault();
// })

formModifProfil.style.display = "none";

bouttonModifProfil.addEventListener("click", function(){
    if(formModifProfil.style.display === "none"){
        formModifProfil.style.display = "block";
    }
});

bouttonAnnulModif.addEventListener("click", function(){
    formModifProfil.style.display = "none"
});


window.addEventListener("DOMContentLoaded", function(){

    // ioClient = io("https://blizzardfans.herokuapp.com/",{reconnection: true});
    ioClient = io("localhost:8080",{reconnection: true});

    ioClient.on("connect",function(){
        console.log("Connecté au serveur");




        /********************** BARRE DE RECHERCHE *********************/
        
        rechercheUsers.addEventListener('submit', function(event){
            event.preventDefault();
            console.log("le mot clé est envoyé")
            console.log(rechercheUsers.children[0].value);

            ioClient.emit("searchingUsers", rechercheUsers.children[0].value)})

            ioClient.on("listUsers", function(list){
                console.log(list)

                let searchlist = list;
                console.log(searchlist[0].pseudo, searchlist[0].nom, searchlist[0].prenom);
                
                searchlist.forEach(function(index,value){
                    console.log("/////"+index.pseudo)
                    console.log(value)
                    
                    
                });
                
            })
        })

        /*************************************************/


        // ioClient.on("message", function(event){
        //     var chatData = JSON.parse(event.data);
        //     console.log(chatData);

        //     var divElement = window.document.getElementById("messages");
        //     divElement.innerHTML += 
        // })

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