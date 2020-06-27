"use strict"

/**********************
 * 
 * PARTIE EXPRESS
 * 
 **********************/

/************ Configuration des modules ************/

const express = require("express");
const expressSession = require("express-session");
const MongoClient = require("mongodb").MongoClient;
const connectMongo = require("connect-mongo");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const nodemailer = require("nodemailer");
const uuidv1 = require("uuidv1");
const generator = require('generate-password');

const app = express();

app.set("view engine","pug");

app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(express.static(__dirname+"/src"));
app.use("/images", express.static(__dirname+"/src"));
app.use(cookieParser());

app.get("/", function(req, res){
    res.render("home");
});
app.get("/accueil", function(req, res){
    res.render("murActu");
});
app.get("/profil", function(req,res){
    res.render("profil");
});
app.get("/messages", function(req, res){
    res.render("messages");
});
app.get("/mdplost", function(req, res){
    res.render("mdpPerdu");
});


/************************ Configuration Session **************************/

const MongoStore = connectMongo(expressSession);

//variables pour l'expiration des cookies et pour la durée de la session
var cookieExpiration = 60*60*1000; // 1 heure
var sessionLife = 60*60*1000;

const options = {
    store: new MongoStore({
        url : "mongodb+srv://admin:Sergio94@blizzardfans-1t2aw.mongodb.net/Blizzardfans" 
    }),
    secret: "1234Secret",
    saveUninitialized: true,
    resave: false,
    expires: new Date(Date.now()+cookieExpiration),
    rolling: true, // reset maxAge on every response
    cookie: {
        maxAge: sessionLife,
        expires: new Date(Date.now()+sessionLife)
    }
}


app.use(expressSession(options))

/***********************************/


const urlDb = "mongodb+srv://admin:Sergio94@blizzardfans-1t2aw.mongodb.net/Blizzardfans?retryWrites=true&w=majority"
const nameDb = "Blizzardfans";



/**************** GESTION NODEMAILER ******************/

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'blizzardfansprojet@gmail.com',
        pass: 'motDePasseSecuriteMax94!'
    }
});

process.env.NODE_TLS_REJECT_UNAUTHORIZED ='0';


var mailOptionsInscription = { //faire plusieurs var confirmation inscription
    from : "noreply@blizzardfansprojet.com",
    to: "",
    subject: "Validation de l'inscription",
    text: "Bienvenue sur BlizzardFan's, vous êtes bien enregistré en tant que membre"
};
var mailOptionsMessages = {
    from : "noreply@blizzardfansprojet.com",
    to: "",
    subject: "Vous avez reçu un message",
    text: "Bonjour, Vous avez reçu un message sur BlizzardFan's"
};
var mailOptionsMdp = {
    from : "noreply@blizzardfansprojet.com",
    to: "",
    subject: "Mot de passe perdu",
    text: ""
};

var envoiMail = function(mailOptions){
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            console.log("error send mail")
        }else{
            console.log("Email sent:" + info.response)
        }
    })
};

/***************** MIDDLEWARES ********************/

// app.use(function(req, res, next){
//     if(req.url == "/" || req.url == "/inscription" || req.url == "/connexion" || req.url == "/amis"){
//         next()
//     }else{
//         if (!req.session.userName) {
//             console.log("test")
//             res.cookie("user_id", "", {
//                 expires: new Date(Date.now() + 900000),
//                 httpOnly: false
//             })
//             res.redirect("/home")
//         } else {
//             console.log("test2")
//             res.cookie("user_id", req.session.uuid, {
//                 expires: new Date(Date.now() + 900000),
//                 httpOnly: false
//             })
//             next()
//         }
//     }
// });

// //Verification si l'utilisateur à toujours sa session active

// app.get("/", function(req, res){
//     if(req.cookies){
//         MongoClient.connect(urlDb,{useUnifiedTopology: true}, function(err,client){

//             let db = client.db("blizzardfans");
//             let collection = db.collection("sessions");
//             if(req.session.authentification === true){
//                 res.redirect("/profil");
//             }else{
//                 res.redirect("/home");
//             }
//         })
//     }
// });

/******************* DEFINITION D'UNE VARIABLE USER ******************/

var user;

MongoClient.connect(urlDb, {useUnifiedTopology: true}, function(err, client){
    if(err){
        console.log("error var user");
    }else{
        let db = client.db("Blizzardfans");
        let collection = db.collection("users");
        collection.find({}, {projection:{uuid:1, pseudo:1, mail:1, nom:1, prenom:1, genre:1, ville:1, preference:1, amis:1}}).toArray(function(err,data){
            if(err){
                console.log("error find of var user");
            }else{
                user = data;
            }
        })
    }
});
console.log(user)


/****************** GESTION INSCRIPTION ***********************/

app.post("/inscription", function(req, res){
    MongoClient.connect(urlDb, {useUnifiedTopology: true}, function(err, client){

        let db = client.db("Blizzardfans");
        let collection = db.collection("users");
        if(err){
            console.log("erreur connection users")
        }else{

            // test si les champs ne sont pas vides
            if(req.body.pseudo === ""||req.body.nom ===""||req.body.prenom===""||req.body.adresseMail===""||req.body.ville===""||req.body.genre===""||req.body.motDePasse===""||req.body.preference === req.body.preference.selected){
                res.render("home",{message:"Veuillez saisir les informations"})
            };
            collection.find({mail: req.body.adresseMail}).toArray(function(err, data){
                console.log(data.length);
                if(data.length){
                    res.render("home",{message:"Adresse Mail déjà associée à un compte"})
                }else{
                    let db = client.db("Blizzardfans");
                    let collection = db.collection("users");
                    let pseudo = req.body.pseudo;
                    let mdp = req.body.motDePasse;
                    let nom = req.body.nom;
                    let prenom = req.body.prenom;
                    let ville = req.body.ville;
                    let mail = req.body.adresseMail;
                    let genre = req.body.genre;
                    let preference = req.body.preference;
                    let uuid = uuidv1();
                    let friends = {};
                    friends["waiting"]=[];
                    friends["confirm"]=[];
                    friends["ignored"]=[];
                    let role = "Utilisateur";
                    let insertion = {};

                    // creation de la session
                    req.session.uuid = uuid;
                    req.session.authentification = true;
                    req.session.userName = nom;
                    req.session.userForname = prenom;
                    req.session.userPseudo = pseudo;
                    req.session.userMail = mail;
                    req.session.role = role;
                    
                    // insertion de l'inscrit dans la collection users
                    insertion.pseudo = pseudo;
                    insertion.nom = nom;
                    insertion.prenom = prenom;
                    insertion.mail = mail;
                    insertion.mdp = mdp;
                    insertion.uuid = uuid;
                    insertion.ville = ville;
                    insertion.genre = genre;
                    insertion.role = role;
                    insertion.preference = preference;

                    collection.insertOne(insertion, function(err,client){
                        if(err){
                            console.log("erreur d'insertion");
                        }else{
                            res.cookie("user_id", uuid, {
                                expires: new Date(Date.now()+900000),
                                httpOnly: false
                            })

                            console.log(mailOptionsInscription);
                            mailOptionsInscription.to = insertion.mail;
                            console.log(mailOptionsInscription);
                            envoiMail(mailOptionsInscription);

                            res.redirect("/accueil");

                        }
                    })
                }
            })
        }   
    })
});

/********************* GESTION CONNEXION *************************/

app.post("/connexion", function(req, res){
    MongoClient.connect(urlDb, {useUnifiedTopology:true}, function(err, client){
        if(err){
            console.log("error connect");
        }
        if(req.body.mail === "" || req.body.mdp === ""){
            res.render("home",{
                info:"Veuillez saisir les informations"
            })
        }

        let db = client.db("Blizzardfans");
        let collection = db.collection("users");
        let email = req.body.mail;
        let motDePasse = req.body.mdp;

        collection.find({mail : email}).toArray(function(err, data){
            console.log(data)
            if(err){
                console.log("erreur niveau connexion");
            }
            if(data.length){
                let user = data[0];
                console.log(data[0]);

                if(user.mdp === motDePasse && user.mail === email){
                    console.log(user.mail, user.mdp)
                    req.session.userName = user.nom;
                    req.session.userForname = user.prenom;
                    req.session.userPseudo = user.pseudo;
                    req.session.authentification = true;
                    req.session.uuid = user.uuid;
                    req.session.userMail = user.mail;
                    res.cookie("user_id", user.uuid, {
                        expires: new Date(Date.now() + 900000),
                        httpOnly: false
                    });

                    res.render("murActu");
                }else{
                    res.render("home",{
                        info:"Identifians incorrects"
                    });
                }
            }
        })
    })
})

/**************** GESTION MDP PERDU *****************/


app.post("/mdplost", function(req, res){
    MongoClient.connect(urlDb, {useUnifiedTopology: true}, function(err, client){
        if(err){
            console.log("erreur connection (mdplost)");
        }
        if(req.body.mail === ""){
            res.render("/mdpPerdu", {
                erreur: "Veuillez entrer votre adresse mail"
            });
        }
        var password = generator.generate({
            length: 10,
            numbers: true
        });
        console.log(password)

        let db = client.db(nameDb);
        let collection = db.collection("users");
        let eMail = req.body.mail;
        console.log("test")
        collection.find({mail: eMail}).toArray(function(err, data){
            console.log(data, err)
            if(data.length === 0){
                res.render("/mdpPerdu",{erreur : "Erreur"})
            }
            if(data[0].mail === eMail){
                console.log(user.mdp);
                user.mdp = password;

                console.log(mailOptionsMdp);
                mailOptionsMdp.text= "Bonjour, voici votre nouveau mot de passe : \n"+ user.mdp +" Veuillez penser à le modifier tout de suite après votre connexion"
                mailOptionsMdp.to = eMail;
                console.log(mailOptionsMdp);
                envoiMail(mailOptionsMdp);
                console.log(data[0].mail)

                res.redirect("home")
            }
        })
    })
})


/**************** GESTION DES AMIS *****************/
var test = function(){
    var li = window.document.createElement("li")
}
app.get("/amis", function(req, res){
    res.render("amis",{test: test()});
    console.log(user);
    // faire le filter waiting / confirm / ignore ici

});


app.get("/test", function(req, res){
    res.render("test",{test:user})
})



/***************************
 * 
 * PARTIE SOCKET IO
 * 
 **************************/

const serverHTTP = app.listen(process.env.PORT || 8080, function(){
    console.log("Server is connected")
});

const io = require("socket.io");
// const e = require("express");
// const { isBuffer } = require("util");

const webSocketServer = io(serverHTTP);

webSocketServer.on("connect", function(socket){

    console.log(user);
    console.log("test heroku")
    
})