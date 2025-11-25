const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB setup using .env
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Database and collection
let productsCollection;

async function connectDB() {
  try {
    await client.connect();
    console.log('MongoDB connected successfully!');
    const db = client.db('merxomart');
    productsCollection = db.collection('products');
  } catch (err) {
    console.error('MongoDB connection error:', err);
  }
}

connectDB();

// Routes

// GET all products
app.get('/api/products', async (req, res) => {
  try {
    const products = await productsCollection.find({}).toArray();
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST new product
app.post('/api/products', async (req, res) => {
  try {
    const { name, description, descriptionDetail, rating, price, imgSrc } =
      req.body;

    if (!name || !description || !price || !imgSrc) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const newProduct = {
      name,
      description,
      descriptionDetail,
      rating: rating || 0,
      price,
      imgSrc,
    };

    const result = await productsCollection.insertOne(newProduct);

    res.status(201).json({
      message: 'Product added successfully',
      product: { _id: result.insertedId, ...newProduct },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE a product by _id
app.delete('/api/products/:id', async (req, res) => {
  try {
    const id = req.params.id;

    const result = await productsCollection.deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Root route
app.get('/', (req, res) => {
  res.send('Merxomart Server is running');
});

// Start server
app.listen(port, () => {
  console.log(`Merxomart Server running on port ${port}`);
});
