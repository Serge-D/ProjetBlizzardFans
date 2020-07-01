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
const cors = require("cors");
const helmet = require("helmet")

const app = express();

app.set("view engine","pug");

app.use(helmet())
app.use(helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'" ,'fonts.gstatic.com',"github.com","cdnjs.cloudflare.com"],
      styleSrc: ["'self'","stackpath.bootstrapcdn.com",'fonts.gstatic.com']
    }
  }))
app.use(cors());
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
app.get("/messages", function(req, res){
    res.render("messages");
});
app.get("/mdplost", function(req, res){
    res.render("mdpPerdu");
});
app.get("/apropos", function(req, res){
    res.render("apropos");
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

/***************** MIDDLEWARES AVEC GESTION DES DROITS ********************/
//utiliser pour les pages admins / invités / inscrits
app.use(function(req, res, next){
    if(req.url == "/" || req.url == "/inscription" || req.url == "/connexion" ){
        next()
    }else{
        if (!req.session.userName) {
            console.log("test")
            res.cookie("user_id", "", {
                expires: new Date(Date.now() + 900000),
                httpOnly: false
            })
            res.redirect("/home")
        } else {
            console.log("test2")
            res.cookie("user_id", req.session.uuid, {
                expires: new Date(Date.now() + 900000),
                httpOnly: false
            })
            next()
        }
    }
});
 app.use(function(req, res){
     if(req.session.role != "Admin" && req.session.role != "Utilisateur"){
            res.render("home")
     }
 })

/******************* DEFINITION D'UNE VARIABLE USER ******************/

var user;

MongoClient.connect(urlDb, {useUnifiedTopology: true}, function(err, client){
    if(err){
        console.log("error var user");
    }else{
        let db = client.db("Blizzardfans");
        let collection = db.collection("users");
        collection.find({}, {projection:{uuid:1, pseudo:1, mail:1, nom:1, prenom:1, genre:1, ville:1, preference:1, friends:1}}).toArray(function(err,data){
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
                    insertion.friends = friends;

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

                            res.render("profil",{pseudo:pseudo, nom:nom, prenom:prenom, mail:mail, ville:ville,preference:preference, genre:genre });

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
        if(req.body.pseudo === "" || req.body.mdp === ""){
            res.render("home",{
                info:"Veuillez saisir les informations"
            })
        }

        let db = client.db("Blizzardfans");
        let collection = db.collection("users");
        let pseudo = req.body.pseudo;
        let motDePasse = req.body.mdp;

        collection.find({pseudo : pseudo}).toArray(function(err, data){
            console.log(data)
            if(err || data.length === 0){
                console.log("erreur niveau connexion");
                res.render("home",{info:"Identifians incorrects"});
            }else{
                let user = data[0];
                console.log(data[0]);

                if(user.mdp === motDePasse && user.pseudo === pseudo){
                    console.log(user.pseudo, user.mdp)
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

                    res.render("profil",{pseudo:data[0].pseudo,nom:data[0].nom, prenom:data[0].prenom, mail:data[0].mail, ville:data[0].ville,preference:data[0].preference });
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
                mailOptionsMdp.text= "Bonjour, voici votre nouveau mot de passe : "+ user.mdp +"\nVeuillez penser à le modifier tout de suite après votre connexion"
                mailOptionsMdp.to = eMail;
                console.log(mailOptionsMdp);
                envoiMail(mailOptionsMdp);
                console.log(data[0].mail)
                
                collection.updateOne({mail:eMail},{$set:{mdp:password}})

                res.render("home",{info:"Un nouveau mot de passe a été envoyé par mail"})
            }
        })
    })
})

/****************** GESTION AFFICHAGE PROFIL *****************/

app.get("/profil", function(req,res){
    MongoClient.connect(urlDb, {useUnifiedTopology: true}, function(err, client){
        if(err){
            console.log("erreur connect mongo");
        }
        let db = client.db(nameDb);
        let collection = db.collection("users");
        let uuidUser = req.session.uuid
        collection.find({uuid : uuidUser}).toArray(function(err, data){
            if(err){
                console.log("Error !")
            }

            res.render("profil",{pseudo:data[0].pseudo,nom:data[0].nom, prenom:data[0].prenom, mail:data[0].mail,genre:data[0].genre, ville:data[0].ville,preference:data[0].preference});
            return;
        })
    })
    
});

/****************** GESTION MODIF PROFIL *********************/

app.post("/modifProfil", function(req,res){
    MongoClient.connect(urlDb,{useUnifiedTopology: true}, function(err, client){
        if(err){
            console.log("erreur connect pour modif profil");
        }
        let db = client.db(nameDb);
        let collection = db.collection("users");
        let uuidCurrentUser = req.session.uuid;
        collection.find({uuid: uuidCurrentUser}).toArray(function(err, data){
            if(err){
                console.log("uuid not found for modifProfil")
            }else{
                let modifpseudo = req.body.pseudo;
                let modifmdp = req.body.motDePasse;
                let modifville = req.body.ville;
                let modifpreference = req.body.preference;

                collection.updateOne({uuid:uuidCurrentUser},{$set:{pseudo:modifpseudo,   mdp:modifmdp, ville:modifville, preference:modifpreference}});

                collection.find({uuid: uuidCurrentUser}).toArray(function(err,data){
                    if(err){
                        console.log("collection not found after update")
                    }
                    console.log(data)
                    res.render("profil",{pseudo:data[0].pseudo,nom:data[0].nom, prenom:data[0].prenom, mail:data[0].mail, ville:data[0].ville,preference:data[0].preference });
                })
            }
        })
    })
})

/***************** GESTION DES PUBLICATIONS *********************/

app.post("/nouvelleactu", function(req,res){
    

    MongoClient.connect(urlDb, {useUnifiedTopology: true}, function(err,client){
        let db= client.db(nameDb);
        let collection = db.collection("actualites");

        let nouvelleactu = req.body.nouvelleactu;
        let sender = req.session.userPseudo;
        let insertion = {};

        insertion.actualite = nouvelleactu;
        insertion.sender = sender;

        collection.insertOne(insertion, function(err, client){
            if(err){
                console.log("erreur d'insertion actualité")
            }

        })
    })
})



/**************** GESTION DES AMIS *****************/


app.get("/amis", function(req, res){
    
    const allUser = user
    const currentUserUuid = req.session.uuid
    const currentUserData = user.filter(r => r.uuid == currentUserUuid)
    // const currentUserData = user.filter(r => r.uuid != currentUserUuid)
    // ["uuid.friends.confirm"].forEach((rEach) => {
     //   user.filter(r => r.uuid != rEach)
    // })
    /*************waiting ***********/
    const currentUserFriendsWaitingList = currentUserData[0].friends.waiting;
    const currentUserFriendsWaitingListData = [];
    currentUserFriendsWaitingList.forEach((rEach) => {
        const result = user.filter(r => r.uuid == rEach)
        currentUserFriendsWaitingListData.push(result[0])
    });
    console.log(currentUserFriendsWaitingListData)
    /*************confirm *************/
    const currentUserFriendsConfirmList = currentUserData[0].friends.confirm;
    const currentUserFriendsConfirmListData = [];
    currentUserFriendsConfirmList.forEach((rEach) => {
        const result = user.filter(r => r.uuid == rEach)
        currentUserFriendsConfirmListData.push(result[0])
    });
    console.log(currentUserFriendsConfirmList)
    console.log(currentUserFriendsConfirmListData)
    /*************all users*************/

    const allUserListData = [];
    // const allUserListuser.filter(r => r.uuid != currentUserUuid)

    
    // const currentUserFriendsWaitingListData = user.filter(r => r.uuid == currentUserFriendsWaitingList[0])
    res.render("amis",{currentUserData:currentUserData, currentUserFriendsWaitingListData:currentUserFriendsWaitingListData.filter(Boolean), currentUserFriendsConfirmList:currentUserFriendsConfirmList.filter(Boolean)})
})



/******************* GESTION DECONNEXION *******************/


app.get("/logout", function(req, res){
    req.session.destroy(function(err){
        console.log("destroy session");
        res.render("home");
    })
});


/***************** GESTION DU CHAT ******************/

app.get("/messages", function(req, res){
    console.log(user)
    MongoClient.connect(urlDb, {useUnifiedTopology: true}, function(err, client){
        if(err){
            console.log("Cannot connect to database");
        }else{
            const db = client.db(nameDb);
            const collection = db.collection("messages");

            collection.find().toArray(function(err, data){
                if(err){
                    console.log("unable to fetch documents");
                }else{
                    console.log("rendering...");
                    res.render("messages",{documents: data, pseudonyme: user.pseudo})
                }
            })
        }
    })
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
const session = require("express-session");
// const e = require("express");
// const { isBuffer } = require("util");

const webSocketServer = io(serverHTTP);

const connectedPeople = [];
    

webSocketServer.on("connect", function(socket){
    
    console.log("socket id");
    console.log(socket.id);
/****************************************************** */    
    socket.emit("peopleLogIn", connectedPeople);
    
    socket.on("login", function(){
        const utilisateur = {
            id: socket.id,
            pseudo: user.pseudo
        };
        console.log("/////////")
        console.log(utilisateur)
        connectedPeople.push(utilisateur)
    })


/************************** DISCUSSION INSTANTANNEE ***************************** */

    socket.on("messages", function(webSocketData){
        var chatData = JSON.parse(webSocketData.utf8Data);

        MongoClient.connect(urlDb, {useUnifiedTopology: true}, function(err, client){
            if(err){
                console.log("erreur connect");
            } else {

                let db = client.db(nameDb);
                let collection = db.collection("messages");
                if(chatData && chatData.hasOwnProperty("message")){
                    collection.insertOne(chatData)
                } else{
                    console.log("Missing property in chat data")
                }
            }
        })

        const chatDataAsString = JSON.stringify(chatData);
        establishedSockets.forEach(function(socket){
            socket.sendUTF(chatDataAsString)
        })
    })
    

    /**************GESTION SEARCH BAR *******************/

    let searchUSers = function(keyword){
        console.log("in function search")
    

        MongoClient.connect(urlDb, {useUnifiedTopology: true}, function(err, client){
            if(err){
                console.log("erreur connexion mongo pour la recherche user");
            }else{
                console.log("recherche d'user");
                const db = client.db(nameDb);
                const collection = db.collection("users");
                collection.find({$or:[{prenom:{ $regex: keyword, $options:"i" }},{nom:{ $regex: keyword, $options:"i" }},{pseudo:{ $regex: keyword, $options:"i" }}]}, {projection:{pseudo:1, nom:1, prenom:1, _id:0}}).toArray(function(err, data){
                    if(err){
                        console.log("error dans la recherche");
                    }else{
                        console.log("dans la recherche");
                        let searchResults = data;
                        console.log(data);
                        console.log(searchResults.length);
                        

                    if(!data){
                        console.log("aucun resultat pour cette recherche");
                        let message = "Aucun résultat pour votre recherche";
                        socket.emit("noresults",{msg: message})
                    }else{
                        socket.emit("listUsers", searchResults)
                        console.log("envoyé")
                    }

                    } 
                })
            }
        })
    }



    socket.on("searchingUsers", function(keyword){
        console.log(keyword);
        searchUSers(keyword)
    });









})


/***************************************************
 * 
 * pour la gestion des roles, faire des middlewares avec le req.session.role et afficher les pages ou non en fonction du role
 * creer un pug avec page error 404 pour ceux qui ne peuvent pas voir les pages
 * 
 * 
 * 
*/