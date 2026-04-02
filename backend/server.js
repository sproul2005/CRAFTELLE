require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const connectDB = require('./src/config/db');
const errorHandler = require('./src/middleware/error.middleware');


const auth = require('./src/routes/auth.routes');
const products = require('./src/routes/product.routes');
const cart = require('./src/routes/cart.routes');
const orders = require('./src/routes/order.routes');
const coupons = require('./src/routes/coupon.routes');
const wishlist = require('./src/routes/wishlist.routes');
const payment = require('./src/routes/payment.routes');


connectDB();

const app = express();

// Compress HTTP responses
app.use(compression({
    level: 6,
    threshold: 10 * 1024 // 10KB
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());

app.use('/api/v1/auth', auth);
app.use('/api/v1/products', products);
app.use('/api/v1/cart', cart);
app.use('/api/v1/orders', orders);
app.use('/api/v1/coupons', coupons);
app.use('/api/v1/wishlist', wishlist);
app.use('/api/v1/payment', payment);
app.use('/api/v1/payment', payment);
app.use('/api/v1/upload', require('./src/routes/upload.routes'));
app.use('/api/v1/admin', require('./src/routes/analytics.routes'));


app.get('/', (req, res) => {
    res.send('HASTHKALA Backend is running');
});


app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);

    server.close(() => process.exit(1));
});

