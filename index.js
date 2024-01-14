const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config()
const jwt = require('jsonwebtoken');
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

        const userCollection = client.db('touristDB').collection('users');
        const packageCollection = client.db('touristDB').collection('packages');
        const storyCollection = client.db('touristDB').collection('stories');
        const bookingCollection = client.db('touristDB').collection('bookings');
        const wishlistCollection = client.db('touristDB').collection('wishlists');


        // jwt collection
        app.post('/jwt', async(req, res)=>{
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_SECRET_TOKEN, {expiresIn: '3h'});
            res.send({token})
        })

        // middleware
        // verify Token
        const verifyToken = (req, res, next) =>{
            console.log('inside verify token',req.headers.authorization);
            if(!req.headers.authorization){
                return res.status(401).send({message: 'unauthorize access'})
            }
            const token = req.headers.authorization.split(' ')[1];
            jwt.verify(token, process.env.ACCESS_SECRET_TOKEN, (err, decoded)=>{
                if(err){
                    return res.status(401).send({message: 'unauthorize access'})
                }
                req.decoded = decoded;
                next();
            })   
        }

        // verify admin
        const verifyAdmin = async (req, res, next) =>{
            const email = req.decoded.email;
            const query = {email: email}
            const user = await userCollection.findOne(query);
            const isAdmin = user?.role === 'admin';
            if(!isAdmin){
                return res.status(403).send({message: 'forbidden access'})
            }
            next();
        }


        // users collection
        app.post('/users', async(req, res)=>{
            const user= req.body;
            // if users exits or not
            const query = {email : user.email}
            const exitingUser = await userCollection.findOne(query)
            if(exitingUser){
                return res.send({message: 'user already exits', insertedId: null})
            }
            const result = await userCollection.insertOne(user);
            res.send(result);
        })

        app.get('/users', verifyToken,  async(req, res)=>{
          
            const result = await userCollection.find().toArray();
            res.send(result);
        })

        // check admin
        app.get('/users/admin/:email', verifyToken, async(req, res)=>{
            const email = req.params.email;
            if(email !== req.decoded.email){
                return res.status(403).send({message: "forbidden access"})
            }
            const query = {email: email}
            const user = await userCollection.findOne(query);
            let admin = false;
            if(user){
                admin = user?.role === 'admin'
            }
            res.send({admin});
        })

        // for make an admin api
        app.patch('/users/admin/:id',verifyToken, verifyAdmin, async(req, res)=>{
            const id = req.params.id;
            const filter = {_id: new ObjectId(id)};
            const updateDoc = {
                $set: {
                    role : 'admin'
                }
            }
            const result = await userCollection.updateOne(filter, updateDoc);
            res.send(result)
        })

        // for make tour guide api
        app.patch('/users/guide/:id', verifyToken, async(req, res)=>{
            const id = req.params.id;
            const filter = {_id: new ObjectId(id)};
            const updateDoc = {
                $set: {
                    role : 'guide'
                }
            }
            const result = await userCollection.updateOne(filter, updateDoc);
            res.send(result)
        })

        // check tour guide
        app.get('/users/guide/:email', verifyToken, async(req, res)=>{
            const email = req.params.email;
            if(email !== req.decoded.email){
                return res.status(403).send({message: "forbidden access"})
            }
            const query = {email: email}
            const user = await userCollection.findOne(query);
            let guide = false;
            if(user){
                guide = user?.role === 'guide'
            }
            res.send({guide});
        })

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

        app.post('/stories', async(req, res)=>{
            const story = req.body;
            const result = await storyCollection.insertOne(story);
            res.send(result);
        })

        // booking collection
        app.post('/bookings', async(req, res)=>{
            const booking = req.body;
            const result = await bookingCollection.insertOne(booking);
            res.send(result);
        })

        app.get('/bookings', async(req, res)=>{
            let query = {};
            if(req.query?.email){
                query = {email: req.query.email}
            }
            const result = await bookingCollection.find(query).toArray();
            res.send(result);
        })

        app.delete('/bookings/:id', async(req, res)=>{
            const id = req.params.id;
            const query = {_id: new ObjectId(id)};
            const result = await bookingCollection.deleteOne(query);
            res.send(result);
        })

        // wishlists collection
        app.post('/wishlists', async(req, res)=>{
            const wishlist = req.body;
            const result = await wishlistCollection.insertOne(wishlist);
            res.send(result);
        })

        app.get('/wishlists', async(req, res)=>{
            let query = {};
            if(req.query?.email){
                query = {email: req.query.email}
            }
            const result = await wishlistCollection.find(query).toArray();
            res.send(result);
        })
        app.delete('/wishlists/:id', async(req, res)=>{
            const id = req.params.id;
            const query = {_id: new ObjectId(id)}
            const result = await wishlistCollection.deleteOne(query);
            res.send(result)
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