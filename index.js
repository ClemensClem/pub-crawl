const express = require("express");
const app = express();
const axios = require("axios");

const secrets = require("./secrets");

///////////
//Socket.io
//these two lines of code should be declared underneath "app"
const server = require("http").Server(app);
const io = require("socket.io")(server, { origins: "localhost:8080" });

//End socket.io
///////////////

const compression = require("compression");
const cookieSession = require("cookie-session");
const csurf = require("csurf");
//Generates random string
const cryptoRandomString = require("crypto-random-string");

const { uploader } = require("./upload");
const s3 = require("./s3");

//imported db requests
const {
    addUser,
    addResetCode,
    addFriendRequest,
    addNewMessage,
    addEventData,
    addParticipant,
    deleteFriendship,
    deleteParticipation,
    getPassword,
    getResetCode,
    getUser,
    getMostRecentlyRegisteredUser,
    getMatchingUsers,
    getFriendshipState,
    getFriends,
    getCommunityChat,
    getNewMessage,
    getCommonFriends,
    getEventDetails,
    getParticipants,
    getEvents,
    updateUserPassword,
    updateProfilePic,
    updateBio,
    updateFriendship,
    updateEventData,
    updateEventPic,
    updateEventDescription,
    checkEMail,
    checkParticipation,
} = require("./db.js");
//importing AWS SES
const { sendEmail } = require("./ses.js");

//Middleware comes here
///////////////////////

app.use(compression());

app.use(express.json());

app.use(express.static("public"));

/////////////////////////////////////////
///Changing cookie session for socket.io
//this allows socket to be aware of the cookie

const cookieSessionMiddleware = cookieSession({
    secret: `I'm always angry.`,
    maxAge: 1000 * 60 * 60 * 24 * 90,
});

app.use(cookieSessionMiddleware);
io.use(function (socket, next) {
    cookieSessionMiddleware(socket.request, socket.request.res, next);
});

//end of socket.io cookie session
/////////////////////////////////

//////////
//Security

// let key;
// if (process.env.PORT) {
//     //this will run if Social Network is running on heroku
//     key = process.env; //cookieSeesionScret is the property with which secret is set up to Heroku step 17)
// } else {
//     //this will run if project is running on localhost
//     key = require("./secrets.json");
// }

//End of security
//////////////////////

////////////////////
//CSurf
app.use(csurf());
app.use(function (req, res, next) {
    res.cookie("mytoken", req.csrfToken());
    next();
});

//B-Crypt
const { hash, compare } = require("./bc.js");
//End
//////////

//Compiles React into Plain Javascript
const { createProxyMiddleware } = require("http-proxy-middleware");

if (process.env.NODE_ENV != "production") {
    app.use(
        createProxyMiddleware("/bundle.js", {
            target: "http://localhost:8081/",
        })
    );
} else {
    app.use("/bundle.js", (req, res) => res.sendFile(`${__dirname}/bundle.js`));
}

////////////
//Start POST

app.post("/register", (req, res) => {
    let { first, last, email } = req.body;
    hash(req.body.password).then((hashedPw) => {
        addUser(first, last, email, hashedPw)
            .then((idObj) => {
                req.session.userId = idObj.rows[0].id;
                console.log("req.session.userId: ", req.session.userId);
            })
            .then(() => {
                res.json({ success: true });
            })
            .catch((err) => {
                console.log('ERROR in POST "/register": ', err);
                res.json({ success: false });
            });
    });
});

app.post("/login", (req, res) => {
    const { email, password } = req.body;
    //Checking if password for email is identical to according pw in database
    getPassword(email)
        .then((dataObj) => {
            const pwFromDatabase = dataObj.rows[0].password;
            const userId = dataObj.rows[0].id;
            compare(password, pwFromDatabase).then((authentication) => {
                //if passwords are identical --> "true"
                if (authentication) {
                    req.session.userId = userId;
                    res.json({ success: true });
                    //if passwords are not identical --> "false"
                } else {
                    res.json({ success: false });
                }
            });
        })
        .catch((err) => {
            console.log('ERROR in POST"/login": ', err);
            res.json({ success: false });
        });
});

app.post("/password/reset/start", (req, res) => {
    const { email } = req.body;
    //Check if email is existing in user table
    checkEMail(email)
        .then((dataObj) => {
            //if email is existing continue to next step of reset password process
            if (dataObj.rows[0]) {
                const secretCode = cryptoRandomString({
                    length: 6,
                });
                const { first, last } = dataObj.rows[0];
                //hashing the secret code for storing it in table
                hash(secretCode).then((hashedSecretCode) => {
                    //storing reset code in database
                    addResetCode(email, hashedSecretCode)
                        //sending mail with reset code details
                        .then((dataObj) => {
                            console.log(
                                "DB insert reset pw successful for user with the id: ",
                                dataObj
                            );
                            //defining parameters for email sending service
                            const recipient = email;
                            const message = `Hello Dear ${first} ${last}, 
                        Here is your code for resetting your password: ${secretCode}
                        Cheers
                        Your Support Team`;
                            const subject = `Password Reset`;
                            //Sending email
                            sendEmail(recipient, message, subject)
                                .then(() => {
                                    res.json({ success: true });
                                })
                                .catch((err) => {
                                    console.log(
                                        "ERROR in AWS SES sendEmail: ",
                                        err
                                    );
                                    res.json({
                                        success: false,
                                    });
                                });
                        })
                        .catch((err) => {
                            console.log(
                                'ERROR in POST "/password/reset/start" database insert "addResetCode"; ',
                                err
                            );
                            res.json({
                                success: false,
                            });
                        });
                });
            } else {
                res.json({ success: false });
            }
        })
        .catch((err) => {
            console.log(
                'ERROR in POST "/password/reset/start" checkMail: ',
                err
            );
            res.json({ success: false });
        });
});

app.post("/password/reset/verify", (req, res) => {
    const { email, resetCode, password } = req.body;
    //getting most recent reset-code from table reset_codes
    getResetCode(email)
        .then(({ rows }) => {
            //check if reset-code younger then 10 Minutes is existing for email
            //if yes go here
            if (rows[0]) {
                const resetCodeFromDatabase = rows[0].code;
                //compare value from input field with value from database
                compare(resetCode, resetCodeFromDatabase)
                    .then((authentication) => {
                        //if values are consistent
                        if (authentication) {
                            //hash password
                            hash(password)
                                .then((hashedPw) => {
                                    //update password in users table
                                    updateUserPassword(
                                        hashedPw,
                                        email
                                    ).then(() => res.json({ success: true }));
                                })
                                .catch((err) => {
                                    console.log(
                                        'ERROR in POST "/password/reset/verify" --> updateUserPassword: ',
                                        err
                                    );
                                    res.json({ success: false });
                                });
                        } else {
                            console.log(
                                'POST "/password/reset/verify" Verification failed'
                            );
                            res.json({ success: false });
                        }
                    })
                    .catch((err) => {
                        console.log(
                            'ERROR in POST "/password/reset/verify" --> compare codes: ',
                            err
                        );
                        res.json({ success: false });
                    });
                //if no reset-code for email younger then 10 minutes is existing in table reset_codes then go ahead here
            } else {
                console.log(
                    'POST "/password/reset/verify" -->no match in getResetCode'
                );
                res.json({ success: false });
            }
        })
        .catch((err) => {
            console.log(
                'ERROR in POST "/password/reset/verify" --> getResetCode: ',
                err
            );
            res.json({ success: false });
        });
});

app.post(
    "/upload-profile-picture",
    uploader.single("file"),
    s3.upload,
    async (req, res) => {
        console.log("Server: /upload-profile-picture", req.file);
        if (req.file) {
            let url =
                "https://s3.amazonaws.com/imageboardbucketclem/" +
                req.file.filename;

            try {
                await updateProfilePic(url, req.session.userId);
                res.json({ success: true, url: url });
            } catch (err) {
                console.log('ERROR in POST ""/upload-profile-picture": ', err);
                res.json({ success: false });
            }
        } else {
            res.json({
                success: false,
            });
        }
    }
);

app.post("/update-bio", async (req, res) => {
    let { bio } = req.body;
    try {
        await updateBio(bio, req.session.userId);
        res.json({ success: true });
        // console.log("I am the /update-bio", req.body.bio);
    } catch (err) {
        console.log('ERROR in POST "/update-bio": ', err);
        res.json({ success: false });
    }
});

app.post("/make-friend-request/:id.json", async (req, res) => {
    let receiverId = req.params.id;
    let senderId = req.session.userId;
    try {
        await addFriendRequest(senderId, receiverId);
        res.json({
            success: true,
            nextFriendshipStatus: "Cancel Friend Request",
        });
    } catch (err) {
        console.log(
            `ERROR in POST "/make-friend-request/${receiverId}": `,
            err
        );
        res.json({ success: false });
    }
});

app.post("/end-friendship/:id.json", async (req, res) => {
    let receiverId = req.params.id;
    let senderId = req.session.userId;
    try {
        await deleteFriendship(senderId, receiverId);
        res.json({
            success: true,
            nextFriendshipStatus: "Make Friend Request",
        });
    } catch (err) {
        console.log(`ERROR in POST "/end-friendship/${receiverId}": `, err);
        res.json({ success: false });
    }
});

app.post("/accept-friend-request/:id.json", async (req, res) => {
    let receiverId = req.params.id;
    let senderId = req.session.userId;
    try {
        await updateFriendship(senderId, receiverId);
        res.json({
            success: true,
            nextFriendshipStatus: "End Friendship",
        });
    } catch (err) {
        console.log(
            `ERROR in POST "/accept-friend-request/${receiverId}": `,
            err
        );
        res.json({ success: false });
    }
});

app.post("/create-event", async (req, res) => {
    const hostId = req.session.userId;
    const mapData = "";
    try {
        const { rows } = await addEventData(hostId, mapData);
        res.json({ success: true, eventId: rows[0].event_id });
    } catch (err) {
        console.log('ERROR in POST "/create-event"-route: ', err);
        res.json({ success: false });
    }
    // console.log("store-map-data: ", req.body);
});

app.post("/update-event-data", async (req, res) => {
    let { eventId } = req.body;
    const mapDataJsonString = JSON.stringify(req.body);
    try {
        await updateEventData(mapDataJsonString, eventId);
        res.json({ success: true });
    } catch (err) {
        console.log('ERROR in POST "/update-event-data"-route: ', err);
        res.json({ success: false });
    }
});

app.post(
    "/upload-event-picture",
    uploader.single("file"),
    s3.upload,
    async (req, res) => {
        const eventId = req.file.originalname;
        console.log("Server: /upload-event-picture", req.file);
        if (req.file) {
            let url =
                "https://s3.amazonaws.com/imageboardbucketclem/" +
                req.file.filename;

            try {
                await updateEventPic(url, eventId);
                res.json({ success: true, url: url });
            } catch (err) {
                console.log('ERROR in POST "/upload-event-picture": ', err);
                res.json({ success: false });
            }
        } else {
            res.json({
                success: false,
            });
        }
    }
);

app.post("/update-event-description", async (req, res) => {
    const { eventId, title, description, date, time } = req.body;
    try {
        await updateEventDescription(eventId, title, description, date, time);
        res.json({ success: true });
    } catch (err) {
        console.log('ERROR in POST "/update-event-description"-route: ', err);
        res.json({ success: false });
    }
});

app.post("/join-event", async (req, res) => {
    const { eventId } = req.body;
    const participantId = req.session.userId;
    console.log('"/join-event" --> data: ', req.body);
    try {
        await addParticipant(eventId, participantId);
        res.json({ success: true });
    } catch (err) {
        console.log('ERROR in POST "/join-event"-route: ', err);
        res.json({ success: false });
    }
});

//End POST
//////////

///////////
//Start GET

app.get("/welcome", (req, res) => {
    if (req.session.userId) {
        res.redirect("/");
    } else {
        res.sendFile(__dirname + "/index.html");
    }
});

app.get("/user", async (req, res) => {
    try {
        //destructering the data object from the db response
        const { rows } = await getUser(req.session.userId);
        const user = rows[0];
        res.json(user);
    } catch (err) {
        console.log('ERROR in GET "/user": ', err);
        res.json({ success: false });
    }
});

app.get("/user/:id.json", async (req, res) => {
    //converting string value to number
    const profileId = Number(req.params.id);
    try {
        //checks if requested user profile equals the logged in user
        if (profileId === req.session.userId) {
            console.log("User equals Profile");
            res.json({ userEqualsProfile: true });
        } else {
            //get data from user
            const { rows } = await getUser(profileId);
            const userProfile = rows[0];
            res.json(userProfile);
        }
    } catch (err) {
        console.log(`ERROR in GET "/user/${profileId}.json": `, err);
        res.json({ success: false });
    }
});

app.get("/find-users/:searchString.json", async (req, res) => {
    let userSearch = req.params.searchString;
    try {
        //a userSearch = "<space>" means that no search-input was entered in the input field. In this case, the standrad query is triggered which gives back the 3 most recent signed up members
        if (userSearch === " ") {
            const { rows } = await getMostRecentlyRegisteredUser();
            res.json(rows);
        } else {
            const { rows } = await getMatchingUsers(userSearch);
            res.json(rows);
            console.log("find-users ", rows);
        }
    } catch (err) {
        console.log(`Error in GET "/find-users/${userSearch}.json: "`, err);
        res.json({ success: false });
    }
});

app.get("/get-status-of-friendship/:id.json", async (req, res) => {
    //for getting the initial status it is irrelevnat if the logged in user is the sender or receiver of a friendship request because initially you don't have this information while doing the request
    //for this reason the query searches each column with each id (OR statement in query)!
    let receiverId = req.params.id;
    let senderId = req.session.userId;
    try {
        const { rows } = await getFriendshipState(receiverId, senderId);
        if (!rows[0]) {
            res.json({ success: true, result: "Make Friend Request" });
        } else if (rows[0].accepted) {
            res.json({ success: true, result: "End Friendship" });
        } else if (rows[0].sender_id === req.session.userId) {
            res.json({ success: true, result: "Cancel Friend Request" });
        } else {
            res.json({ success: true, result: "Accept Friend Request" });
        }
    } catch (err) {
        console.log(
            `/get-status-of-friendship/${receiverId}.json - ERROR: `,
            err
        );
        res.json({ success: false });
    }
});

app.get("/friends-wannabes", async (req, res) => {
    const loggedInUser = req.session.userId;
    try {
        const { rows } = await getFriends(loggedInUser);
        console.log('GET "/friends-wannabes" data: ', rows);
        res.json(rows);
    } catch (err) {
        console.log('ERROR in GET "/friends-wannabes": ', err);
        res.json({ success: false });
    }
});

app.get("/get-event-data/:id.json", async (req, res) => {
    const eventId = req.params.id;
    const userId = req.session.userId;
    try {
        const { rows } = await getEventDetails(eventId);
        //checks if user is host
        const userIsHost = rows[0].host === userId;
        res.json({ userIsHost: userIsHost, rows });
    } catch (err) {
        console.log('ERROR in GET "/get-event-data/:id.json": ', err);
        res.json({ success: false });
    }
});

app.get("/check-participation/:id.json", async (req, res) => {
    const eventId = req.params.id;
    const participantId = req.session.userId;
    try {
        const { rows } = await checkParticipation(eventId, participantId);
        console.log('GET "/get-event-data/:id.json" data: ', rows);
        if (rows[0]) {
            res.json({ success: true });
        } else {
            res.json({ success: false });
        }
    } catch (err) {
        console.log('ERROR in GET "/check-participation/:id.json": ', err);
        res.json({ success: false });
    }
});

app.get("/leave-event/:id.json", async (req, res) => {
    const eventId = req.params.id;
    const participantId = req.session.userId;
    try {
        const { rows } = await deleteParticipation(eventId, participantId);
        res.json({ success: true });
    } catch (err) {
        console.log('ERROR in GET "/leave-event/:id.json": ', err);
        res.json({ success: false });
    }
});

app.get("/get-participants/:id.json", async (req, res) => {
    const eventId = req.params.id;
    try {
        const { rows } = await getParticipants(eventId);
        console.log("get participants: ", rows);
        res.json(rows);
    } catch (err) {
        console.log('ERROR in GET "/leave-event/:id.json": ', err);
        res.json({ success: false });
    }
});

app.get("/get-events", async (req, res) => {
    try {
        const { rows } = await getEvents();
        console.log("get-events: ", rows);
        res.json(rows);
    } catch (err) {
        console.log('ERROR in GET "/get-events": ', err);
        res.json({ success: false });
    }
});

//Logout
app.get("/logout", (req, res) => {
    req.session = null;
    console.log('Logout, redirect to GET "/welcome');
    res.redirect(301, "/welcome");
});

//This should be the final route!
app.get("*", function (req, res) {
    if (!req.session.userId) {
        res.redirect(301, "/welcome");
    } else {
        res.sendFile(__dirname + "/index.html");
    }
});

//End GET
/////////

//changing  "app.isten" to "server.listen" for making socket.io
server.listen(8080, function () {
    console.log("I'm listening.");
});

//here comes socket.io code:

io.on("connection", async (socket) => {
    //all of our socket code is here

    console.log(`socket id ${socket.id} is now connected`);

    //if there is no logged-in user then disconnect from socket
    if (!socket.request.session.userId) {
        return socket.disconnect(true);
    }

    //the user is logged in and socket code will run as usual
    const userId = socket.request.session.userId;

    //user is logged in and connected to socket.io --> get the last (10) chat messages
    try {
        const { rows } = await getCommunityChat();
        //emitting an event to socket.io
        io.sockets.emit("chatMessageHistory", rows.reverse());
    } catch (err) {
        console.log('ERROR in "io.on"--> getCommunityChat: ', err);
    }

    //receiving new messages user are typing in chat.js
    socket.on("New Message", async (newMsg) => {
        console.log("This message is coming from chat.js component: ", newMsg);
        console.log("User that sends the message: ", userId);
        try {
            //storing message in database
            const resAddNewMessage = await addNewMessage(newMsg, userId);
            const { message_id } = resAddNewMessage.rows[0];
            //retrieving all the senders information
            const resGetNewMessage = await getNewMessage(message_id);
            //sending new message object to all clients
            io.sockets.emit("addChatMsg", resGetNewMessage.rows[0]);
        } catch (err) {
            console.log("ERROR in io.on --> addNewMessage ", err);
        }
    });

    //Additional feature 06 - Friends on Profile Pages
    socket.on("Common Friends", async (userProfileId) => {
        const { rows } = await getCommonFriends(userId, userProfileId);
        try {
            io.sockets.sockets[socket.id].emit("Common Friends List", rows);
        } catch (err) {
            console.log('ERROR in socket.on("Common Friends"... : ', err);
        }
    });

    //Retrieving nearby places from Google Places nearby API
    socket.on("Get nearby places", async (currentLocation) => {
        console.log("current location: ", currentLocation);
        const { lat, lng } = currentLocation;
        const radius = 2;
        const type = "bar"; //https://developers.google.com/places/web-service/supported_types
        const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${
            radius * 1000
        }&type=${type}&key=${secrets.GOOGLE_API_KEY}`;
        try {
            const { config, data } = await axios.get(url);
            let searchResult = {
                originalRequestUrl: "",
                nextBarsToken: "",
                bars: {},
            };
            if (data.results.length > 0) {
                searchResult.bars = data.results;
                searchResult.originalRequestUrl = config.url;

                /*                 = {
                    originalRequestUrl: originalRequestUrl,
                    nextBarsToken: nextBarsToken,
                    bars: data.results,
                }; */

                if (data.next_page_token) {
                    //reading out the src for photo
                    //const imgUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo_reference}&key=${secrets.GOOGLE_API_KEY}`;
                    //setting the url for getting next set of bars
                    //example for url for requesting next set of bars: const nextBars = `https://maps.googleapis.com/maps/api/place/nearbysearch/xml?location=42.9825,-81.254&radius=50000&name=Medical%22Clinic&sensor=false&key=[KEY GOES HERE]&pagetoken=[NEXT PAGE TOKEN GOES HERE]`;
                    searchResult.nextBarsToken = `&pagetoken=${data.next_page_token}`;
                }
            }
            io.sockets.sockets[socket.id].emit("First 20 places", searchResult);
        } catch (err) {
            console.log('ERROR in index.js --> "Get nearby places": ', err);
        }
    });
});
