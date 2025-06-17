const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()

const admin = require("firebase-admin");
const serviceAccount = require("./firebase-admin.json");

const app = express();
const port = process.env.PORT || 5000;


// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@dbuser.9mw1e0i.mongodb.net/?retryWrites=true&w=majority&appName=dbUser`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});


admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});


// firebase verifyToken 
const verifyFirebaseToken = async (req, res, next) => {

    const authHeader = req.headers?.authorization;

    if (!authHeader || !authHeader?.startsWith('Bearer ')) {
        return res.status(401).send({ message: 'unauthorize access' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = await admin.auth().verifyIdToken(token);
        req.decoded = decoded;
        next()
    }
    catch (error) {
        res.status(401).send({ message: 'unauthorize access' })
    }
}

const verifyTokenEmail = (req, res, next) => {
    if (req.query.email !== req.decoded.email) {
        return res.status(403).send({ message: 'Forbidden access' });
    }
    next();
}



async function run() {
    try {
        // await client.connect();
        const database = client.db('social_serve');
        const eventCollections = database.collection('events');
        const joinedEventsCollections = database.collection('joinedEvents')


        app.get('/events', async (req, res) => {
            const { email, type, search } = req.query;

            const currentDate = new Date().toISOString()
            const query = { eventDate: { $gte: currentDate } };

            // if (email) {
            //     query.creator = email
            // }
            if (type) {
                query.eventType = type
            }
            if (search) {
                query.title = { $regex: search, $options: 'i' }
            }

            const futureEvents = await eventCollections.find(query).sort({ eventDate: 1 }).toArray();
            res.send(futureEvents);
        })

        app.get('/manageEvents', verifyFirebaseToken, verifyTokenEmail, async (req, res) => {
            const { email } = req.query;
            const currentDate = new Date().toISOString()
            const query = { eventDate: { $gte: currentDate } };
            if (email) {
                query.creator = email
            }
            const futureEvents = await eventCollections.find(query).sort({ eventDate: 1 }).toArray();
            res.send(futureEvents);
        })

        app.get('/latestEvents', async (req, res) => {
            const latestEvent = await eventCollections.find().sort({ postDate: -1 }).limit(6).toArray();
            res.send(latestEvent)
        })
        app.get('/events/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await eventCollections.findOne(query);
            res.send(result);
        })
        app.get('/joinedEvents/:email', verifyFirebaseToken, async (req, res) => {
            const email = req.params.email;

            if (email !== req.decoded?.email) {
                return res.status(403).send({ message: 'Forbidden access' });
            }

            const query = { participant: email };
            const result = await joinedEventsCollections.find(query).sort({ eventDate: 1 }).toArray();
            res.send(result)
        })
        app.post('/events', verifyFirebaseToken, async (req, res) => {
            const event = req.body;
            const result = await eventCollections.insertOne(event);
            res.send(result);
        })
        app.post('/joinedEvents', verifyFirebaseToken, async (req, res) => {
            const joinedEvents = req.body;
            const result = await joinedEventsCollections.insertOne(joinedEvents);
            res.send(result)
        })
        app.put('/eventUpdate/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const updateEventData = req.body;

            const updateDoc = {
                $set: updateEventData
            }
            const result = await eventCollections.updateOne(filter, updateDoc);
            res.send(result);

        })
        app.delete('/eventDelete/:id', verifyFirebaseToken, async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await eventCollections.deleteOne(query);
            res.send(result);
        })
        app.delete('/cancelEvent/:id', verifyFirebaseToken, async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await joinedEventsCollections.deleteOne(query);
            res.send(result);
        })

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