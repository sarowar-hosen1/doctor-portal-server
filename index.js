const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.oor8w.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const app = express()
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
const port = 5000


client.connect(err => {
  const appointmentCollection = client.db(`${process.env.DB_NAME}`).collection("appointments");

  app.post("/addAppointment", (req, res) => {
    const appointment = req.body;
    console.log(appointment);
    appointmentCollection.insertOne(appointment)
      .then(result => {
        res.send(result.insertedCount > 0)
      })
  })

  app.post("/appointmentsByDate", (req, res) => {
    const date = req.body;
    console.log(date.date);
    appointmentCollection.find({ date: date.date })
      .toArray((err, documents) => {
        res.send(documents)
      })
  })

  app.get('/allPatients', (req, res) => {
    appointmentCollection.find({})
      .toArray((err, documents) => {
        res.send(documents)
      })
  })

  app.get('/prescriptions', (req, res)=>{
    appointmentCollection.find({})
    .toArray((err, documents) => {
      res.send(documents)
    })
  })

});

app.get('/', (req, res) => {
  res.send('Hello World!55')
})

app.listen(process.env.PORT || port)