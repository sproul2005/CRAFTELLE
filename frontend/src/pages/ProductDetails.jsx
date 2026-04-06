import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '../services/api';
import { motion } from 'framer-motion';
import { ShoppingBag, ChevronLeft, Upload, Star, Share2, Heart, Truck, ShieldCheck, Eye } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import RelatedProducts from '../components/RelatedProducts';
import Footer from '../components/Footer';

const ProductDetails = () => {
    const { id } = useParams();
    const { addToCart } = useCart();
    const { addToWishlist } = useWishlist();
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [product, setProduct] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    
    const [selectedSize, setSelectedSize] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [customText, setCustomText] = useState('');
    const [customImage, setCustomImage] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Review Form State
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchProductAndReviews();
        
        if (location.state?.openReviewModal) {
            setIsReviewModalOpen(true);
        }
    }, [id, location.state]);

    const fetchProductAndReviews = async () => {
        try {
            const [productRes, reviewsRes] = await Promise.all([
                api.get(`/products/${id}`),
                api.get(`/products/${id}/reviews`)
            ]);

            setProduct(productRes.data.product);
            setReviews(reviewsRes.data.reviews || []);

            if (productRes.data.product.sizes && productRes.data.product.sizes.length > 0) {
                setSelectedSize(productRes.data.product.sizes[0].label);
            }
        } catch (error) {
            console.error("Failed to fetch product data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToWishlist = () => {
        addToWishlist(product);
        alert("Added to Wishlist!");
    };

    const handleBuyNow = () => {
        if (!user) {
            alert("Please log in to place an order.");
            navigate('/login');
            return;
        }
        if (!selectedSize) return alert('Please select a size');

        navigate('/checkout', {
            state: { product, selectedSize, quantity }
        });
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: product.name,
                    text: `Check out ${product.name} at Craftelle!`,
                    url: window.location.href
                });
            } catch (error) {
                console.log("Error sharing", error);
            }
        } else {
            
            navigator.clipboard.writeText(window.location.href);
            alert("Product link copied to clipboard!");
        }
    };

    const submitReview = async (e) => {
        e.preventDefault();
        if (!user) {
            alert("Please log in to submit a review.");
            navigate('/login');
            return;
        }

        setIsSubmittingReview(true);
        try {
            await api.post(`/products/${id}/reviews`, { rating, comment });
            alert("Review submitted successfully!");
            setComment('');
            setRating(5);
            setIsReviewModalOpen(false);
            fetchProductAndReviews(); // Refresh to show new review
        } catch (error) {
            alert(error.response?.data?.error || "Failed to submit review. You may have already reviewed this product.");
        } finally {
            setIsSubmittingReview(false);
        }
    };

    if (loading) return <div className="container section">Loading...</div>;
    if (!product) return <div className="container section">Product not found</div>;

    const activeSizePrice = product.sizes.find(s => s.label === selectedSize)?.price || product.price;

    const getOptimizedUrl = (url) => {
        if (!url || !url.includes('cloudinary')) return url;
        return url.replace('/upload/', '/upload/f_auto,q_auto,w_800/');
    };

    const schemaData = {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": product.name,
        "image": product.images[0]?.url,
        "description": product.description,
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": product.averageRating || 5,
            "reviewCount": reviews.length || 1
        },
        "offers": {
            "@type": "Offer",
            "priceCurrency": "INR",
            "price": activeSizePrice,
            "availability": "https://schema.org/InStock"
        }
    };

    return (
        <div>
            <Helmet>
                <title>{product.name} | Hasthkala Handmade</title>
                <meta name="description" content={product.description.substring(0, 150)} />
                <meta property="og:title" content={product.name} />
                <meta property="og:image" content={product.images[0]?.url} />
                <meta name="twitter:card" content="summary_large_image" />
                <script type="application/ld+json">
                    {JSON.stringify(schemaData)}
                </script>
            </Helmet>
            <div className="container" style={{ padding: 'clamp(1rem, 4vw, 3rem) 1rem 0 1rem' }}>
                <button 
                    onClick={() => {
                        if (location.state?.fromCategory) {
                             navigate(`/?category=${encodeURIComponent(location.state.fromCategory)}#products-section`);
                        } else {
                             navigate(-1);
                        }
                    }} 
                    style={{ marginBottom: '1.5rem', border: 'none', background: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-light)', cursor: 'pointer' }}
                >
                    <ChevronLeft size={16} /> Back
                </button>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'clamp(2rem, 5vw, 4rem)', marginBottom: '1.5rem' }}>
                    {}
                        {}
                        <div style={{ position: 'relative', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {/* Main Image */}
                            <div style={{ width: '100%', aspectRatio: '1/1', backgroundColor: 'var(--color-surface)', borderRadius: '8px', overflow: 'hidden' }}>
                                {product.images.length > 0 ? (
                                    <img
                                        src={getOptimizedUrl(product.images[currentImageIndex].url)}
                                        alt={`${product.name} main`}
                                        referrerPolicy="no-referrer"
                                        fetchpriority="high"
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                ) : (
                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No Image</div>
                                )}
                            </div>
                            
                            {/* Thumbnail Gallery */}
                            {product.images.length > 1 && (
                                <div style={{
                                    display: 'flex',
                                    gap: '0.5rem',
                                    overflowX: 'auto',
                                    scrollbarWidth: 'none', 
                                    msOverflowStyle: 'none',
                                    paddingBottom: '0.5rem'
                                }} className="hide-scrollbar">
                                    {product.images.map((img, idx) => (
                                        <div 
                                            key={idx} 
                                            onClick={() => setCurrentImageIndex(idx)}
                                            style={{ 
                                                flexShrink: 0, 
                                                width: '80px', 
                                                height: '80px', 
                                                borderRadius: '6px', 
                                                overflow: 'hidden',
                                                cursor: 'pointer',
                                                border: currentImageIndex === idx ? '2px solid #111' : '2px solid transparent',
                                                opacity: currentImageIndex === idx ? 1 : 0.6,
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            <img
                                                src={img.url}
                                                alt={`${product.name} thumbnail ${idx + 1}`}
                                                referrerPolicy="no-referrer"
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                    {}
                    <div>
                        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', marginBottom: '0.2rem', fontFamily: 'serif', color: '#0f172a', fontWeight: 500, lineHeight: 1.1 }}>{product.name}</h1>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex' }}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star key={star} size={16} fill={star <= Math.round(product.averageRating || 0) ? "#facc15" : "none"} color={star <= Math.round(product.averageRating || 0) ? "#facc15" : "#e5e7eb"} />
                                ))}
                            </div>
                            <span style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                                ({reviews.length} reviews)
                            </span>
                        </div>

                        {}
                        <div style={{ marginBottom: '2rem' }}>
                            <h4 style={{ marginBottom: '0.8rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, fontFamily: 'serif', color: '#0f172a' }}>Variants</h4>
                            <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
                                {product.sizes.map(size => (
                                    <button
                                        key={size._id}
                                        onClick={() => setSelectedSize(size.label)}
                                        style={{
                                            padding: '8px 20px',
                                            borderRadius: '25px',
                                            border: selectedSize === size.label ? '1px solid #d97706' : '1px solid #e5e7eb',
                                            backgroundColor: selectedSize === size.label ? '#d97706' : 'white',
                                            color: selectedSize === size.label ? 'white' : '#1f2937',
                                            minWidth: '60px',
                                            cursor: 'pointer',
                                            fontWeight: 500,
                                            fontSize: '0.9rem',
                                            boxShadow: selectedSize === size.label ? '0 4px 10px rgba(217, 119, 6, 0.3)' : 'none',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {size.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
                            <span style={{ fontSize: 'clamp(2rem, 5vw, 2.6rem)', fontWeight: 600, color: '#0f172a', lineHeight: 1 }}>₹{activeSizePrice}</span>
                            <span style={{ fontSize: '1.2rem', textDecoration: 'line-through', color: '#9ca3af', fontWeight: 500 }}>₹{Math.round(activeSizePrice * 1.25)}</span>
                            <span style={{ backgroundColor: '#5b4ae3', color: 'white', padding: '4px 12px', borderRadius: '14px', fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.5px' }}>20% OFF</span>
                        </div>

                        {}
                        <div style={{ marginBottom: '1.2rem' }}>
                            <h4 style={{ fontSize: '1.25rem', marginBottom: '0.6rem', color: '#0f172a', fontFamily: 'serif', fontWeight: 500 }}>Description</h4>
                            <ul style={{ color: '#374151', lineHeight: '1.5', paddingLeft: '1.2rem', margin: 0, fontSize: '1rem' }}>
                                {}
                                {product.description.split('\n').filter(p => p.trim() !== '').map((paragraph, i) => (
                                    <li key={i} style={{ marginBottom: '0.4rem' }}>{paragraph}</li>
                                ))}
                            </ul>
                        </div>

                        {}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem', padding: '1.2rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1e293b', fontSize: '0.9rem' }}>
                                <Truck size={18} color="#3b82f6" /> Free Shipping
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1e293b', fontSize: '0.9rem' }}>
                                <ShieldCheck size={18} color="#3b82f6" /> Secure Payment
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1e293b', fontSize: '0.9rem' }}>
                                <Eye size={18} color="#3b82f6" /> Customized
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1e293b', fontSize: '0.9rem' }}>
                                <Heart size={18} color="#3b82f6" /> Handmade
                            </div>
                        </div>

                        {}
                        <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', alignItems: 'center' }}>
                            {product.customizationType === 'none' && (
                                <div style={{ display: 'flex', border: '1px solid #d1d5db', alignItems: 'center', borderRadius: '4px', backgroundColor: 'white', height: '48px' }}>
                                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ padding: '0 15px', height: '100%', background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#374151' }}>-</button>
                                    <span style={{ padding: '0 15px', fontSize: '1rem', fontWeight: 500, color: '#111' }}>{quantity}</span>
                                    <button onClick={() => setQuantity(quantity + 1)} style={{ padding: '0 15px', height: '100%', background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#374151' }}>+</button>
                                </div>
                            )}
                            <button className="desktop-cart-btn" onClick={handleShare} style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white', border: '1px solid #d1d5db', color: '#374151', borderRadius: '4px', cursor: 'pointer', flexShrink: 0 }}>
                                <Share2 size={20} />
                            </button>
                            <button className="desktop-cart-btn" onClick={handleAddToWishlist} style={{ flex: 1, minWidth: '120px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', backgroundColor: 'white', border: '1px solid #d1d5db', color: '#374151', padding: '0 12px', borderRadius: '4px', fontWeight: 500, cursor: 'pointer' }}>
                                <Heart size={18} /> Wishlist
                            </button>
                            <button className="btn-primary desktop-cart-btn" onClick={handleBuyNow} style={{ flex: 2, minWidth: '180px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', backgroundColor: '#111', color: 'white', border: 'none', padding: '0 12px', borderRadius: '4px', fontWeight: 600, cursor: 'pointer' }}>
                                <ShoppingBag size={18} /> Buy Now
                            </button>
                        </div>
                    </div>
                </div>

                {}
                <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1.5rem', marginTop: '1rem', paddingBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginBottom: '1.5rem', gap: '1rem' }}>
                        <h2 style={{ fontSize: '2.2rem', margin: 0, fontFamily: 'serif', color: '#0f172a', fontWeight: 400 }}>Customer Reviews</h2>
                        <button
                            onClick={() => {
                                if (!user) {
                                    alert("Please log in to submit a review.");
                                    navigate('/login');
                                    return;
                                }
                                setIsReviewModalOpen(true);
                            }}
                            style={{ padding: '0.6rem 1.2rem', borderRadius: '4px', border: 'none', background: '#111', color: 'white', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}
                        >
                            Write a Review
                        </button>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        {reviews.length === 0 ? (
                            <p style={{ color: 'var(--color-text-light)' }}>No reviews yet. Be the first to review this product!</p>
                        ) : (
                            <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                                {reviews.map((review) => (
                                    <div key={review._id} style={{ padding: '0.8rem 1rem', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #f3f4f6' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                                            <strong style={{ fontSize: '1rem', color: '#1f2937' }}>{review.user?.name || review.reviewerName || 'Anonymous User'}</strong>
                                            <div style={{ display: 'flex' }}>
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Star key={star} size={13} fill={star <= review.rating ? "#facc15" : "none"} color={star <= review.rating ? "#facc15" : "#e5e7eb"} style={{ marginLeft: '2px' }} />
                                                ))}
                                            </div>
                                        </div>
                                        <p style={{ fontSize: '0.9rem', lineHeight: '1.4', color: '#4b5563', margin: 0 }}>{review.comment}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {}
                {isReviewModalOpen && (
                    <div
                        onClick={() => setIsReviewModalOpen(false)}
                        style={{
                            position: 'fixed',
                            top: 0, left: 0, right: 0, bottom: 0,
                            backgroundColor: 'rgba(0,0,0,0.5)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            zIndex: 2000,
                            padding: '1rem'
                        }}
                    >
                        <div
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                backgroundColor: 'white',
                                padding: '2rem',
                                borderRadius: '8px',
                                width: '100%',
                                maxWidth: '500px',
                                position: 'relative',
                                maxHeight: '90vh',
                                overflowY: 'auto',
                                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                            }}
                        >
                            <button
                                onClick={() => setIsReviewModalOpen(false)}
                                style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#6b7280', lineHeight: 1 }}
                            >
                                &times;
                            </button>
                            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', color: '#111', marginTop: 0 }}>Write a Review</h3>
                            <form onSubmit={submitReview}>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500, color: '#374151' }}>Rating</label>
                                    <select
                                        value={rating}
                                        onChange={(e) => setRating(Number(e.target.value))}
                                        style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '1rem', backgroundColor: 'white', color: '#111' }}
                                    >
                                        <option value="5">5 - Excellent</option>
                                        <option value="4">4 - Very Good</option>
                                        <option value="3">3 - Good</option>
                                        <option value="2">2 - Fair</option>
                                        <option value="1">1 - Poor</option>
                                    </select>
                                </div>
                                <div style={{ marginBottom: '2rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500, color: '#374151' }}>Your Review</label>
                                    <textarea
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        required
                                        rows="5"
                                        placeholder="What did you like or dislike? What is this product used for?"
                                        style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '4px', resize: 'vertical', fontSize: '1rem', fontFamily: 'inherit', color: '#111' }}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="btn-primary"
                                    disabled={isSubmittingReview}
                                    style={{ width: '100%', padding: '12px', backgroundColor: '#111', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', opacity: isSubmittingReview ? 0.7 : 1 }}
                                >
                                    {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {}
                <div style={{ paddingBottom: '0' }}>
                    <RelatedProducts currentProductId={product._id} />
                </div>

                {}
                <div className="mobile-sticky-action-bar">
                    <button onClick={handleShare} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: '#e5e7eb', border: 'none', color: '#1f2937', fontWeight: 500, padding: '12px', borderRadius: '4px' }}>
                        <Share2 size={18} /> Share
                    </button>
                    <button onClick={handleBuyNow} style={{ flex: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'var(--color-primary)', border: 'none', color: 'white', fontWeight: 500, padding: '12px', borderRadius: '4px' }}>
                        <ShoppingBag size={18} /> Buy Now
                    </button>
                </div>

                <style>{`
                .mobile-sticky-action-bar {
                    display: none;
                }
                .hide-scrollbar::-webkit-scrollbar {
                    display: none; /* Chrome, Safari and Opera */
                }

                @media (max-width: 768px) {
                    .mobile-sticky-action-bar {
                        display: flex;
                        position: fixed;
                        bottom: 0;
                        left: 0;
                        width: 100%;
                        background-color: white;
                        padding: 0.75rem 1rem;
                        box-shadow: 0 -4px 15px rgba(0,0,0,0.1);
                        z-index: 1000;
                        gap: 1rem;
                        padding-bottom: env(safe-area-inset-bottom, 1rem); /* Adds support for iOS safe areas */
                    }
                    
                    /* Hiding the inline add to cart row on mobile so it only shows the sticky bar 
                       Since quantity is handled differently, we can hide the original row entirely. 
                       Alternatively, just hide the button, keep quantity. I will hide the desktop Add to Cart
                       button so there aren't two competing buttons. But if we hide the quantity selector, the user 
                       cannot buy multiple items on mobile. So let's keep the inline one but rely on the sticky one for 
                    /* Removing body padding hack */
                    
                    .desktop-cart-btn {
                        display: none !important;
                    }
                }
            `}</style>
            </div>
            {}
            <div className="mobile-only-spacer" style={{ height: '80px', display: 'none' }}></div>
            <style>{`@media (max-width: 768px) { .mobile-only-spacer { display: block !important; } }`}</style>
            <Footer />
        </div>
    );
};

export default ProductDetails;
