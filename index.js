const express = require('express');
const bodyParser = require("body-parser");
const cors = require("cors");
const admin = require('firebase-admin');
const { MongoClient } = require('mongodb');

const port = 5000;

const app = express();
app.use(cors());
app.use(bodyParser.json());

const serviceAccount = require("./burj-al-arab-e17d2-firebase-adminsdk-k1bwo-3a504a398e.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const uri = "mongodb+srv://burjAlArab:burjAlArab@cluster0.6dt9c.mongodb.net/burjAlArab?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => {
  const bookings = client.db("burjAlArab").collection("bookings");
  console.log("db connection successfully");
  //Create
  app.post("/addBooking", (req, res) => {
    const newBooking = req.body;
    bookings.insertOne(newBooking)
      .then(result => {
        res.send(result.insertedCount > 0)
      })
    console.log(newBooking);
  })
  //Read
  app.get("/bookings", (req, res) => {
    // console.log(req.headers.authorization)
    // console.log(req.query.email)

    const bearer = req.headers.authorization;
    if (bearer && bearer.startsWith("Bearer ")) {
      const idToken = bearer.split(" ")[1];
      // console.log("idToken:", idToken);
      // idToken comes from the client app
      admin
        .auth()
        .verifyIdToken(idToken)
        .then((decodedToken) => {
          // const uid = decodedToken.uid;
          // console.log("uid:", uid)
          const tokenEmail = decodedToken.email;
          const queryEmail = req.query.email;
          console.log(tokenEmail, queryEmail);
          if (tokenEmail == req.query.email) {
              bookings.find({ email: req.query.email })
              .toArray((error, documents) => {
                res.status(200).send(documents);
              })
          }
          else{
            res.status(401).send("Un-authorized Access");
          }
        })
        .catch((error) => {
          res.status(401).send("Un-authorized Access");
        })
    }
    else{
      res.status(401).send("Un-authorized Access");
    }
  })

});


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})