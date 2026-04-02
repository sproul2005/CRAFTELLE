const Product = require('../models/Product');
const APIFeatures = require('../utils/apiFeatures');
const cloudinary = require('../config/cloudinary');
const Review = require('../models/Review');
const Order = require('../models/Order');




exports.createProduct = async (req, res, next) => {
    try {
        let images = [];
        if (typeof req.body.images === 'string') {
            images.push(req.body.images);
        } else {
            images = req.body.images;
        }

        let imagesLinks = [];

        
        
        
        

        
        
        

        
        
        
        

        
        

        if (req.files && req.files.length > 0) {
            const cloudinary = require('../config/cloudinary');
            imagesLinks = [];
            for (let i = 0; i < req.files.length; i++) {
                const result = await cloudinary.uploader.upload(req.files[i].path, {
                    folder: 'hasthkala/products'
                });
                if (result?.public_id && result?.secure_url) {
                    imagesLinks.push({
                        public_id: result.public_id,
                        url: result.secure_url,
                    });
                } else {
                    console.warn(`Cloudinary upload failed for file ${i + 1}: result incomplete`, result);
                }
            }
            req.body.images = imagesLinks;
        } else if (req.body.images) {
            
            
        }

        if (typeof req.body.sizes === 'string') {
            try {
                req.body.sizes = JSON.parse(req.body.sizes);
            } catch (e) {
                
            }
        }

        const product = await Product.create(req.body);

        // Auto-seed 5 random reviews for this new product
        const indianNames = ["Aarav", "Neha", "Vihaan", "Aditi", "Vivaan", "Riya", "Ananya", "Diya", "Ishaan", "Sai", "Arjun", "Kavya", "Saanvi", "Kabir", "Aanya", "Pooja"];
        const positiveComments = ["Absolutely love the craftsmanship! The quality is top-notch.", "Such a beautiful piece.", "Highly recommended! The details are stunning.", "Worth every penny. The delivery was fast.", "Very satisfied with my purchase. Looks exactly like the pictures."];
        
        let newRatingSum = 0;
        const reviewsToAdd = [];
        
        for (let i = 0; i < 5; i++) {
            const rating = Math.random() > 0.3 ? 5 : 4;
            const reviewerName = indianNames[Math.floor(Math.random() * indianNames.length)] + ' ' + ['Sharma', 'Patel', 'Singh', 'Gupta', 'Kumar'][Math.floor(Math.random() * 5)];
            const comment = positiveComments[Math.floor(Math.random() * positiveComments.length)];
            
            reviewsToAdd.push({
                product: product._id,
                reviewerName,
                rating,
                comment
            });
            newRatingSum += rating;
        }
        
        await Review.insertMany(reviewsToAdd);
        product.averageRating = newRatingSum / 5;
        product.numReviews = 5;
        await product.save({ validateBeforeSave: false });

        res.status(201).json({
            success: true,
            product,
        });
    } catch (err) {
        next(err);
    }
};




exports.getProducts = async (req, res, next) => {
    try {
        let query = Product.find();
        let productsCountQuery = {};
        
        if (req.query.trending === 'true') {
            query = Product.find({ isTrending: true });
            productsCountQuery = { isTrending: true };
        }
        
        const resPerPage = Number(req.query.limit) || 8;
        const productsCount = await Product.countDocuments(productsCountQuery);

        const apiFeatures = new APIFeatures(query, req.query)
            .search()
            .filter()
            .pagination(resPerPage);

        const products = await apiFeatures.query;

        res.status(200).json({
            success: true,
            count: products.length,
            productsCount,
            resPerPage,
            products,
        });
    } catch (err) {
        next(err);
    }
};




exports.getProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                error: 'Product not found'
            });
        }

        res.status(200).json({
            success: true,
            product,
        });
    } catch (err) {
        next(err);
    }
};




exports.updateProduct = async (req, res, next) => {
    try {
        let product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                error: 'Product not found'
            });
        }

        // Parse existingImages kept by the user
        let existingImages = [];
        if (req.body.existingImages) {
            try {
                const parsed = typeof req.body.existingImages === 'string' ? JSON.parse(req.body.existingImages) : req.body.existingImages;
                if (Array.isArray(parsed)) {
                    existingImages = parsed;
                } else if (parsed) {
                     existingImages = [parsed];
                }
            } catch (e) {
                console.error("Error parsing existingImages", e);
            }
        }
        
        let imagesLinks = [];
        if (req.files && req.files.length > 0) {
            for (let i = 0; i < req.files.length; i++) {
                const result = await cloudinary.uploader.upload(req.files[i].path, {
                    folder: 'hasthkala/products'
                });
                if (result?.public_id && result?.secure_url) {
                    imagesLinks.push({
                        public_id: result.public_id,
                        url: result.secure_url,
                    });
                } else {
                    console.warn(`Cloudinary upload failed for file ${i + 1}: result incomplete`, result);
                }
            }
            
            const combinedImages = [...existingImages, ...imagesLinks];
            req.body.images = combinedImages;
        } else {
            // If no new files uploaded, just save the existing ones the user kept
            req.body.images = existingImages;
        }

        
        if (typeof req.body.sizes === 'string') {
            try {
                req.body.sizes = JSON.parse(req.body.sizes);
            } catch (e) { console.error("Size parse error", e); }
        }

        product = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
            useFindAndModify: false,
        });

        res.status(200).json({
            success: true,
            product,
        });
    } catch (err) {
        next(err);
    }
};




exports.deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                error: 'Product not found'
            });
        }

        await product.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Product deleted',
        });
    } catch (err) {
        next(err);
    }
};




exports.createProductReview = async (req, res, next) => {
    try {
        const { rating, comment } = req.body;

        
        const hasPurchased = await Order.findOne({
            user: req.user.id,
            'orderItems.product': req.params.id
        });

        if (!hasPurchased) {
            return res.status(400).json({ success: false, error: 'You must purchase this product to review it.' });
        }

        
        const alreadyReviewed = await Review.findOne({
            user: req.user.id,
            product: req.params.id
        });

        if (alreadyReviewed) {
            return res.status(400).json({ success: false, error: 'Product already reviewed' });
        }

        await Review.create({
            user: req.user.id,
            product: req.params.id,
            rating: Number(rating),
            comment
        });

        
        const reviews = await Review.find({ product: req.params.id });
        const avgRating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;

        await Product.findByIdAndUpdate(req.params.id, {
            averageRating: avgRating
        });

        res.status(201).json({
            success: true
        });
    } catch (err) {
        next(err);
    }
};




exports.getProductReviews = async (req, res, next) => {
    try {
        const reviews = await Review.find({ product: req.params.id }).populate('user', 'name');

        res.status(200).json({
            success: true,
            reviews
        });
    } catch (err) {
        next(err);
    }
};
