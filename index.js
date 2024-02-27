const express = require('express');
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config()
const port = process.env.PORT || 5000;
// middleware
const corsOptions ={
  origin:'*', 
  credentials:true,
  optionSuccessStatus:200,
}
app.use(cors(corsOptions));
app.use(express.json());

const verifyJWT = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.status(401).send({ error: true, message: 'unauthorized access' });
  }
  // bearer token use
  const token = authorization.split(' ')[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ error: true, message: 'unauthorized access' })
    }
    req.decoded = decoded;
    next();
  })
}
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
var uri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@ac-ytdlcug-shard-00-00.lvcap8y.mongodb.net:27017,ac-ytdlcug-shard-00-01.lvcap8y.mongodb.net:27017,ac-ytdlcug-shard-00-02.lvcap8y.mongodb.net:27017/?ssl=true&replicaSet=atlas-j6c9nb-shard-0&authSource=admin&retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });
  async function run() {
    try {
         // await client.connect();
    // Send a ping to confirm a successful connection
    const usersCollection = client.db("taskDb").collection("users");
    const tasksCollection = client.db("taskDb").collection("tasks");

      // Connect the client to the server	(optional starting in v4.7)  
//   const usersCollection = client.db("projectDb").collection("users");
console.log("Pinged your deployment. You successfully connected to MongoDB!");
} finally {
  // Ensures that the client will close when you finish/error
  // await client.close();
}
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('project running')
  })
  app.listen(port, () => {
    console.log(`programmer girl sitting on port ${port}`);
  })