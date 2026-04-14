const express = require('express');
const apicache = require('apicache');
const cache = apicache.middleware;
const router = express.Router();
const {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    createProductReview,
    getProductReviews,
    getCategories
} = require('../controllers/product.controller');
const upload = require('../middleware/upload.middleware');
const { protect, authorize } = require('../middleware/auth.middleware');

router.route('/')
    .get(cache('5 minutes'), getProducts)
    .post(protect, authorize('admin'), upload.array('images', 5), createProduct);

router.route('/categories')
    .get(cache('5 minutes'), getCategories);

router.route('/:id')
    .get(cache('5 minutes'), getProduct)
    .put(protect, authorize('admin'), upload.array('images', 5), updateProduct)
    .delete(protect, authorize('admin'), deleteProduct);

router.route('/:id/reviews')
    .post(protect, createProductReview)
    .get(getProductReviews);

module.exports = router;
