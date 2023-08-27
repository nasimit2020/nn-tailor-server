const express = require('express')
const cors = require('cors')
const app = express()
const jwt = require('jsonwebtoken')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send("Hello Word")
})


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nojwczb.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

//JWT verify
const verifyJWT = (req, res, next) =>{
  // console.log('hitting verify JWT');
  const authorization = req.headers.authorization;
  if(!authorization){
    return res.status(401).send({error: true, message: 'unauthorized access'})
  }
  const token = authorization.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, decoded) =>{
    if(error){
      return res.status(403).send({error: true, message: 'verify successfully'})
    }
    req.decoded = decoded;
    next();
  })
}

async function run() {
  try {
    const database = client.db("nnTailor");
    const usersCollection = database.collection("users")
    const services = database.collection("allServices");
    const order = database.collection("allOrders");
    const reviewCollection = database.collection("allReviews");

    //JWT api
    app.post('/jwt', async(req, res) =>{
      await client.connect();
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1h'});
      res.send({token})
    })

    // Users Api
    app.get('/users', verifyJWT, async(req, res)  =>{
      await client.connect();
      const result = await usersCollection.find().toArray();
      res.send(result);
    })

    app.post('/users', async(req, res) =>{
      await client.connect();
      const user = req.body;
      const query = {email: user.email}
      const existingUser = await usersCollection.findOne(query);
      if(existingUser){
        return res.send({message: 'user already exists'})
      }
      const result = await usersCollection.insertOne(user);
      res.send(result)
    })

    app.get('/users/:email', async(req, res) =>{
      await client.connect();
      const email = req.params.email;
      const query = {email: email}
      const result = await usersCollection.findOne(query);
      res.send(result)
    })

    app.patch('/users/admin/:id', async(req,res) =>{
      await client.connect();
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)}
      const updateDoc = {
        $set:{
          role: 'admin'
        }
      }
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.send(result)
    })

    app.delete('/users/delete/:id', async(req,res) =>{
      await client.connect();
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)}
      const result = await usersCollection.deleteOne(filter);
      res.send(result)
    })

    app.post('/addService', async(req, res) =>{
      await client.connect();
      const service = req.body;
      const result = await services.insertOne(service);
      res.send(result);
    })

    app.post('/order', async(req, res) =>{
      await client.connect();
      const orderSubmit = req.body;
      const result = await order.insertOne(orderSubmit);
      res.send(result);
    })

    app.get('/addService', async(req, res) =>{
      await client.connect();
      const result = await services.find({}).toArray();
      res.send(result)
    })

    app.get('/orderList', verifyJWT, async(req, res) =>{
      await client.connect();
      const result = await order.find().toArray();
      res.send(result);
    })

    app.get('/orderList/:email', async(req, res) =>{
      await client.connect();
      const email = req.params;
      const result = await order.find(email).toArray();
      res.send(result);
    })

    app.patch('/orderStatus/:id', async(req, res) =>{
      await client.connect();
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)}
      const status = req.body;
      console.log(status.orderStatus);
      const updateDoc = {
        $set:{
          orderStatus: status.orderStatus
        }
      }
      const result = await order.updateOne(filter, updateDoc)
      res.send(result)
    })

    app.get('/addService/:Id', async(req, res) =>{
      await client.connect();
      const id = req.params.Id;
      const query = { _id: new ObjectId(id)};
      const result = await services.findOne(query);
      res.send(result);
    })

    app.get('/book/payment/:id', async(req, res) =>{
      await client.connect();
      const id = req.params.id;
      const query = { _id: new ObjectId(id)};
      const result = await order.findOne(query);
      res.send(result);
    })

    app.post('/review', async(req, res) =>{
      await client.connect();
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.send(result)
    })

    app.get('/reviews', async(req, res) =>{
      await client.connect();
      const result = await reviewCollection.find().toArray();
      res.send(result);
    })
   

  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);





app.listen(port, () => {
  console.log(`Server running port no ${port}`);
})