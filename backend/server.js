import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import routes from './routes/routes.js';

dotenv.config();

const app = express();
app.use(express.json());

// Use the product routes
app.use('/api/products', routes);

app.listen(5000, () => {
    connectDB();
    console.log('Server started at http://localhost:5000');
});

