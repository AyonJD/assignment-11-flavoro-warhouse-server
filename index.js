const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
const jwt = require('jsonwebtoken');
require("dotenv").config();


app.use(cors());
app.use(express.json())

// console.log(process.env.TOKEN);

app.get('/', (req, res) => {
    res.send('Running my Curd server')
})
// console.log(process.env.DATABASE_USER, process.env.DATABASE_PASS);

const uri = `mongodb+srv://${process.env.DATABASE_USER}:${process.env.DATABASE_PASS}@cluster0.1mu84.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function CheckJWTToken(req, res, next) {
    const hederAuth = req.headers.authorization
    if (!hederAuth) {
        return res.status(401).send({ message: 'unauthorized access.try again' })
    }
    else {
        const token = hederAuth.split(' ')[1]
        console.log({ token });
        jwt.verify(token, '4e8e3e5c9b4d297c407a0ca2b3abc88d5a30bf3142cac344c01bb4f567b60756a658dd932fba00cb9018ffd36a8a571f4022f98dfee30632ad731a827c3cad8b', (err, decoded) => {

            if (err) {
                console.log(err);
                return res.status(403).send({ message: 'forbidden access' })
            }
            console.log('decoded', decoded);
            req.decoded = decoded;
            next()
        })
    }
    console.log(hederAuth, 'inside chckjwt');

}

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

        //JWT
        app.post('/signin', async (req, res) => {
            const user = req.body;
            console.log(req.body, 'user')

            const getToken = jwt.sign(user, '4e8e3e5c9b4d297c407a0ca2b3abc88d5a30bf3142cac344c01bb4f567b60756a658dd932fba00cb9018ffd36a8a571f4022f98dfee30632ad731a827c3cad8b', {
                expiresIn: '1d'
            });

            res.send({ getToken });
        })
        // get items by email 
        app.get('/singleItem', CheckJWTToken, async (req, res) => {
            const decodedEmail = req.decoded.email
            console.log('decodedEmail', decodedEmail);
            const email = req.query.email;
            console.log("email", email);
            if (email === decodedEmail) {
                const query = { email: email }
                const cursor = collection.find(query)
                const items = await cursor.toArray()
                res.send(items)
            }
            else {
                // console.log(param);
                return res.status(403).send({ message: 'forbidden access' })

            }
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

