const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;

app.use(cors());
app.use(express.json())



app.get('/', (req, res) => {
    res.send('Running my Curd server')
})
// console.log(process.env.DATABASE_USER, process.env.DATABASE_PASS);

const uri = `mongodb+srv://assignment:zTT4VLCVfmAEAWVO@cluster0.1mu84.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
    try {
        await client.connect();
        const collection = client.db("assignment").collection("product");
        //Get API----------------->
        app.get('/inventory', async (req, res) => {
            const query = {};
            const cursor = collection.find(query);
            const products = await cursor.toArray();
            res.send(products)
        })

        //Add item
        app.post('/add-item', async (req, res) => {

            const newItem = req.body;

            const result = await collection.insertOne(newItem);
            res.send(result)
        })

        //Find one method
        app.get('/inventory/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const products = await collection.findOne(query)
            res.send(products)
        })
        //Post API---------------->
        app.post('/inventory', async (req, res) => {
            const newProduct = req.body;
            // console.log('Adding new user', newProduct);
            const result = await collection.insertOne(newProduct)
            res.send(result)
        })
        //Delet API---------------->
        app.delete('/inventory/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await collection.deleteOne(query);
            res.send(result)
        })

        //Update
        app.put('/inventory/:id', async (req, res) => {
            const id = req.params.id
            const updateProduct = req.body
            const query = { _id: ObjectId(id) }
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    stock: updateProduct.newQuantity
                }
            }

            const result = await collection.updateOne(query, updateDoc, options)
            res.send(result)
        })
        //Delete
        app.put('/deliver/:id', async (req, res) => {
            const id = req.params.id
            const newQuantity = req.body
            console.log(newQuantity);
            const deliver = newQuantity.quantity - 1
            const query = { _id: ObjectId(id) }
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    stock: deliver
                }
            }

            const result = await collection.updateOne(query, updateDoc, options)
            res.send(result);
        })

    }
    finally {
        // await client.close()
    }
}
run().catch(console.dir)


// app.post('http://localhost:5000/user/add', (req, res) => {
//     res.send(req.body)
// })
app.listen(port, () => {
    console.log('Listening optional callback')
})


