const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()

const app = express();
const port = process.env.PORT || 5000;


// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.Db_pass}@dbuser.9mw1e0i.mongodb.net/?retryWrites=true&w=majority&appName=dbUser`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        await client.connect();
        const database = client.db('social_serve');
        const eventCollections = database.collection('events');
        const joinedEventsCollections = database.collection('joinedEvents')


        app.get('/events', async (req, res) => {
            const currentDate = new Date().toISOString()
            const query = { eventDate: { $gte: currentDate } };
            const futureEvents = await eventCollections.find(query).sort({ eventDate: 1 }).toArray();
            res.send(futureEvents);
        })
        app.get('/eventDetails/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await eventCollections.findOne(query);
            res.send(result);
        })
        app.get('/joinedEvents/:email', async (req, res) => {
            const email = req.params.email;
            const query = { participant: email };
            const result = await joinedEventsCollections.find(query).sort({ eventDate: 1 }).toArray();
            console.log(email)
            res.send(result)
        })
        app.post('/events', async (req, res) => {
            const event = req.body;
            const result = await eventCollections.insertOne(event);
            res.send(result);
        })
        app.post('/joinedEvents', async (req, res) => {
            const joinedEvents = req.body;
            const result = await joinedEventsCollections.insertOne(joinedEvents);
            console.log(joinedEvents)
            res.send(result)
        })
        app.delete('/cancelEvent/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await joinedEventsCollections.deleteOne(query);
            res.send(result);
        })



        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('social serve server site ')
})

app.listen(port, () => {
    console.log(`social serve server on port: ${port}`)
})