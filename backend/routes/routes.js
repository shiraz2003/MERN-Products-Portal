import express from 'express';
import mongoose from 'mongoose';
import Product from '../models/product.model.js';
import upload, { handleUploadError } from '../middleware/upload.js';

const router = express.Router();

// Upload image route with error handling
router.post('/upload', handleUploadError, (req, res) => {
    if (req.file) {
        // Return the path to the uploaded image
        res.json({ 
            success: true, 
            image: `/uploads/${req.file.filename}` 
        });
    } else {
        res.status(400).json({ 
            success: false, 
            message: 'No file uploaded' 
        });
    }
});

// Create a new product
router.post('/', async (req, res) => {
    const product = req.body;
    console.log("Received product:", product);
    
    if (!product.name || !product.price || !product.image) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const newProduct = new Product(product);

    try {
        await newProduct.save();
        console.log("Product saved successfully:", newProduct);
        res.status(201).json({ data: newProduct }); // wrap in { data: ... }
    } catch (error) {
        console.error("Error saving product:", error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
});

// Delete a product by ID
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const product = await Product.findByIdAndDelete(id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json({ message: 'Product removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Get products with pagination and search
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 6;
        const skip = (page - 1) * limit;
        const search = req.query.search || '';
        
        // Build search query
        const searchQuery = search ? {
            $or: [
                { name: { $regex: search, $options: 'i' } }, // Case-insensitive search on name
                { price: search.match(/^\d+$/) ? parseFloat(search) : -1 } // If search is numeric, search price
            ]
        } : {};
        
        // Count total matching products
        const totalProducts = await Product.countDocuments(searchQuery);
        
        // Get filtered products
        const products = await Product.find(searchQuery)
            .sort({ createdAt: -1 })  // Sort by newest first
            .skip(skip)
            .limit(limit);
        
        res.status(200).json({ 
            data: products,
            pagination: {
                totalProducts,
                totalPages: Math.ceil(totalProducts / limit),
                currentPage: page,
                hasMore: skip + products.length < totalProducts
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Update a product by ID
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const product = req.body;
    console.log("Updating product:", id, product);

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ message: 'Invalid product ID format' });
    }

    try {
        const updatedProduct = await Product.findByIdAndUpdate(id, product, { new: true });
        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json({ data: updatedProduct });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

export default router;