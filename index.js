const express = require('express');
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config()
const port = process.env.PORT || 5000;
// middleware
const corsOptions = {
    origin: '*',
    credentials: true,
    optionSuccessStatus: 200,
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

        app.post('/jwt', (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1hr' })
            res.send({ token })
        })

        const verifyAdmin = async (req, res, next) => {
            const email = req.decoded.email;
            const query = { email: email }
            const user = await usersCollection.findOne(query);
            if (user?.role !== 'admin') {
                return res.status(403).send({ error: true, message: 'porbidden message' });
            }
            next();
        }
        app.put('/tasks/:id', async (req, res) => {
            const taskId = req.params.id;
            const updatedData = req.body;

            try {
                const result = await tasksCollection.updateOne({ _id: ObjectId(taskId) }, { $set: updatedData });
                res.send(result);
            } catch (error) {
                console.error("Error updating task:", error);
                res.status(500).send({ error: true, message: "Internal Server Error" });
            }
        });


        // Example server-side route handling the DELETE request for tasks
        app.delete('/tasks/:id', async (req, res) => {
            const taskId = req.params.id;

            try {
                // Perform the deletion in your MongoDB collection
                const result = await tasksCollection.deleteOne({ _id: ObjectId(taskId) });

                if (result.deletedCount === 1) {
                    res.send({ success: true, message: 'Task deleted successfully' });
                } else {
                    res.status(404).send({ success: false, message: 'Task not found' });
                }
            } catch (error) {
                console.error('Error deleting task:', error);
                res.status(500).send({ success: false, message: 'Internal Server Error' });
            }
        });


        app.post('/users', async (req, res) => {
            const user = req.body;
            const query = { email: user.email }
            const existingUser = await usersCollection.findOne(query);
            if (existingUser) {
                return res.send({ message: 'user already exists' })
            }
            const result = await usersCollection.insertOne(user);
            res.send(result);
        });
        app.get('/users', async (req, res) => {
            const result = await usersCollection.find().toArray();
            res.send(result);
        });
        //  all project
        app.post('/tasks', async (req, res) => {
            const newItem = req.body;
            const result = await tasksCollection.insertOne(newItem)
            res.send(result);
        })
        app.get('/tasks', async (req, res) => {
            const result = await tasksCollection.find().toArray();
            res.send(result);
        });


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