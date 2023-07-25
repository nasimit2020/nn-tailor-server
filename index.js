const express = require('express')
const cors = require('cors')
const app = express()
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

async function run() {
  try {
    const database = client.db("nnTailor");
    const services = database.collection("allServices");
    const order = database.collection("allOrders");

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

    app.get('/orderList', async(req, res) =>{
      await client.connect();
      const result = await order.find().toArray();
      res.send(result);
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
   

  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);





app.listen(port, () => {
  console.log(`Server running port no ${port}`);
})