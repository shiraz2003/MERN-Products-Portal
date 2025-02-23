import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { connect } from 'mongoose';
import Product from './models/producst.model.js';
dotenv.config();

const app = express();
app.use(express.json());

app.post('/api/products', async (req, res) => {
const product = req.body; //user will send data 
if(!product.name||!product.price||!product.image){
    return res.status(400).json({message:'All fields are required'});
}

const newProduct = new Product(product);

try{
    await newProduct.save();
    res.status(201).json(newProduct);
}catch(error){
    console.error(error);
    res.status(500).json({message:'Server Error'});
}

});


app.listen(5000, () => {
    connectDB();
    console.log('Server started at http://localhost:5000');
});

