const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
require('dotenv').config();

const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.oor8w.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


const admin = require("firebase-admin");
const serviceAccount = require("./Config/doctor-portal-final-firebase-adminsdk-qqzmg-a4cd2c8799.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});


const app = express()
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(fileUpload())
app.use(express.static('doctors'))
const port = 5000


client.connect(err => {
  const appointmentCollection = client.db(`${process.env.DB_NAME}`).collection("appointments");
  const doctorsCollection = client.db(`${process.env.DB_NAME}`).collection("doctors");

  app.post("/addAppointment", (req, res) => {
    const appointment = req.body;
    console.log(appointment);
    appointmentCollection.insertOne(appointment)
      .then(result => {
        res.send(result.insertedCount > 0)
      })
  })

  app.post('/addDoctor', (req, res) => {
    const file = req.files.file;
    const name = req.body.name;
    const email = req.body.email;
    const phone = req.body.phone;
    file.mv(`${__dirname}/doctors/${file.name}`, (err) => {
      if (err) {
        res.status(5000).send({ msg: "Failed upload to image" })
      }
      doctorsCollection.insertOne({ name, email, phone, img: file.name })
        .then(result => {
          res.send(result.insertedCount > 0)
        })
    })
  })



  app.post("/appointmentsByDate", (req, res) => {
    const date = req.body;
    const email = req.body.email;
    doctorsCollection.find({ email: email })
      .toArray((err, doctor) => {
        if (doctor.length === 0) {
          appointmentCollection.find({email: email})
            .toArray((err, documents) => {
              res.send(documents)
            })
        }
        appointmentCollection.find({ date: date.date })
          .toArray((err, documents) => {
            res.send(documents)
          })
      })

  })

  app.get('/allPatients', (req, res) => {
    appointmentCollection.find({})
      .toArray((err, documents) => {
        res.send(documents)
      })
  })

  app.get('/prescriptions', (req, res) => {
    appointmentCollection.find({})
      .toArray((err, documents) => {
        res.send(documents)
      })
  })

  app.get('/doctors', (req, res) => {
    doctorsCollection.find({})
      .toArray((err, documents) => {
        res.send(documents)
      })
  })

  app.post('/isDoctor', (req, res) => {
    const email = req.body.email;
    const idToken = req.body.token;
    admin.auth().verifyIdToken(idToken)
      .then(decodedToken => {
        const tokenEmail = decodedToken.email;
        doctorsCollection.find({
          $or: [{ email: tokenEmail }, { email: email }]
        })
          .toArray((err, doctor) => {
            res.send(doctor.length > 0)
          })
      })
  })


});

app.get('/', (req, res) => {
  res.send('Hello World!544555')
})

app.listen(process.env.PORT || port)