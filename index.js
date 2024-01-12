const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.l5wiuzk.mongodb.net/?retryWrites=true&w=majority`;

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
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        const packageCollection = client.db('touristDB').collection('packages');
        const storyCollection = client.db('touristDB').collection('stories');

        // packages collection
        app.get('/packages', async(req, res)=>{
            const result = await packageCollection.find().toArray();
            res.send(result);
        })

        app.get('/packages/:id', async(req, res)=>{
            const id = req.params.id;
            const query = {_id: new ObjectId(id)}
            const result = await packageCollection.findOne(query);
            res.send(result)
        })
        app.get('/packages/tour_type/:tour_type', async(req, res)=>{
            const tour_type = req.params.tour_type;
            const query = {tour_type}
            const result = await packageCollection.find(query).toArray();
            res.send(result)
        })

        // story collection
        app.get('/stories', async(req, res)=>{
            const result = await storyCollection.find().toArray();
            res.send(result);
        })
        app.get('/stories/:id', async(req, res)=>{
            const id = req.params.id;
            const query = {_id: new ObjectId(id)}
            const result = await storyCollection.findOne(query);
            res.send(result);
        })


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);






app.get('/', (req, res) => {
    res.send("Tourist guide is running");
})

app.listen(port, () => {
    console.log(`Tourist guide in running on port ${port}`)
})