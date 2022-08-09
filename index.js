const express = require("express");
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const app = express();
const path = require('path');
const bcrypt = require('bcryptjs');
var session = require('express-session')
var flash = require('connect-flash');
const PORT = process.env.PORT || 1010;
const { MongoClient } = require('mongodb');
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 600000 }
}));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);
app.use(flash());




async function main() {
    app.set('views', path.join(__dirname, '/views'));

    app.use("/assets", express.static('assets'));
    var ObjectId = require('mongodb').ObjectId;
    const uri = "mongodb+srv://kumar9625:mongo123@cluster0.ibswj.mongodb.net/?retryWrites=true&w=majority"
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db("socialmedia").collection("users");
    const pdb = client.db("socialmedia").collection("posts");

    const { OAuth2Client } = require('google-auth-library');

    const CLIENT_ID = '134890349659-3857bb1cmggl3ntqe368bqtrt3j0cjj6.apps.googleusercontent.com';
    const gclient = new OAuth2Client(CLIENT_ID);

    app.post('/glogin', (req, res) => {
        let token = req.body.token;

        // console.log(token);

        async function verify() {
            const ticket = await gclient.verifyIdToken({
                idToken: token,
                audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
                // Or, if multiple clients access the backend:
                //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
            });
            const payload = ticket.getPayload();
            const userid = payload['sub'];
            // console.log(payload);
        }
        verify()
            .then(() => {
                res.cookie('session-token', token);
                res.send('Success');
            }).
            catch(console.error);
    })

    function checkAuthenticated(req, res, next) {

        let token = req.cookies['session-token'];

        let user = {};
        async function verify() {
            const ticket = await client.verifyIdToken({
                idToken: token,
                audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
            });
            const payload = ticket.getPayload();
            user.name = payload.name;
            user.email = payload.email;
            user.picture = payload.picture;
        }
        verify()
            .then(() => {
                req.user = user;
                next();
            })
            .catch(err => {
                res.send(err)
            })

    }





    app.post('/signup', async (req, res, next) => {
        const password = req.body.pswd;
        const hash = await bcrypt.hash(password, 12);

        console.log(password)

        const user = {
            name: req.body.txt,
            email: req.body.email,
            pass: req.body.pswd,
            profileimg: `https://avatars.dicebear.com/api/micah/${req.body.txt.substr(0,4)}.svg`,
            password: hash,
            github: req.body.github,
            linkedin: req.body.linkedin,
            instagram: req.body.insta
        }



        const result = await db.insertOne(user).catch(err => {
            console.log(err);
            res.status(200).json({ message: 'creating user failed!' })
        });
        console.log(user)
        res.redirect('/dashboard/' + user._id);
    });
    app.post('/login', async (req, res) => {
        const password = req.body.pswd;
        const user = await db.findOne({ email: req.body.email });
        console.log(user);
        const validpassword = await bcrypt.compare(password, user.password);
        if (validpassword) {
            res.redirect('/dashboard/' + user._id)


        } else {
            res.send("Wrong Credentials!")
        }
    })
    app.get('/dashboard/:id', async (req, res) => {
        const allposts = [];
        query = { _id: ObjectId(req.params.id) }
        const user = await db.findOne(query);
        dbposts = pdb.find().forEach(
            results => {
                allposts.push(results);
            }).then(() => {
                res.render('dashboard.ejs', { user, allposts })
            });

    })


    app.get('/logout', (req, res) => {
        res.clearCookie('session-token');
        res.redirect('/');
    })

    app.post('/userpost/:id', async (req, res) => {
        query = { _id: ObjectId(req.params.id) };
        const user = await db.findOne(query)
        const post = {
            post: req.body.message,
            created_on: new Date(),
            user


        };

        const result = await pdb
            .insertOne(post)
            .then(result => {
                res
                    .redirect('/dashboard/' + req.params.id);
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({ message: 'An error occurred.' });
            });
    })

    app.get('/', (req, res) => {
        res.render('home.ejs')
    })
    app.get('*', (req, res) => {
        res.render('home.ejs');
    })
















}

main().catch(console.error);

app.listen(PORT, () => {
    console.log("listening on port 1010");
})

