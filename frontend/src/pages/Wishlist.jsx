import React from 'react';
import { useWishlist } from '../context/WishlistContext';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Heart, ExternalLink, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getOptimizedUrl } from '../utils/imageUtils';

const Wishlist = () => {
    const { wishlistItems, removeFromWishlist, clearWishlist } = useWishlist();
    const navigate = useNavigate();

    const handleBuyNow = (product) => {
        
        const defaultSize = product.sizes && product.sizes.length > 0 ? product.sizes[0].label : '';
        navigate('/checkout', {
            state: { product, selectedSize: defaultSize, quantity: 1 }
        });
    };

    if (wishlistItems.length === 0) {
        return (
            <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                minHeight: '60vh', textAlign: 'center', padding: '2rem'
            }}>
                <Heart size={64} color="#ccc" strokeWidth={1} style={{ marginBottom: '1.5rem' }} />
                <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', color: '#111', marginBottom: '1rem' }}>
                    Your Wishlist is Empty
                </h2>
                <p style={{ color: '#666', fontSize: '1.1rem', maxWidth: '400px', marginBottom: '2rem' }}>
                    Save your favorite art pieces and customized designs here to find them easily later.
                </p>
                <Link to="/shop" className="btn-primary" style={{ padding: '12px 30px', textDecoration: 'none', borderRadius: '4px' }}>
                    Explore Masterpieces
                </Link>
            </div>
        );
    }

    return (
        <div className="container section" style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-heading)', color: '#111', margin: 0 }}>
                    My Wishlist
                </h1>
                <button
                    onClick={clearWishlist}
                    style={{
                        padding: '10px 20px', 
                        background: 'transparent',
                        border: '2px solid #ff4d4f',
                        color: '#ff4d4f', 
                        borderRadius: '30px', 
                        cursor: 'pointer',
                        fontSize: '0.9rem', 
                        fontWeight: 600, 
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = '#ff4d4f';
                        e.currentTarget.style.color = 'white';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#ff4d4f';
                    }}
                >
                    <Trash2 size={16} />
                    <span>Clear All</span>
                </button>
            </div>

            <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                <AnimatePresence>
                    {wishlistItems.map((item) => (
                        <motion.div
                            key={item._id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            layout
                            style={{
                                border: '1px solid #e0e0e0',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                backgroundColor: 'white',
                                display: 'flex',
                                flexDirection: 'column',
                                position: 'relative'
                            }}
                        >
                            <button
                                onClick={() => removeFromWishlist(item._id)}
                                style={{
                                    position: 'absolute', top: '10px', right: '10px', zIndex: 10,
                                    background: 'white', border: 'none', borderRadius: '50%',
                                    width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: 'var(--color-accent)', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                                }}
                                title="Remove from wishlist"
                            >
                                <Trash2 size={16} />
                            </button>

                            <Link to={`/product/${item._id}`} style={{ display: 'block', height: '220px', overflow: 'hidden', position: 'relative' }}>
                                {item.images && item.images.length > 0 ? (
                                    <img
                                        src={getOptimizedUrl(item.images[0].url, 300)}
                                        alt={item.name}
                                        loading="lazy"
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                ) : (
                                    <div style={{ width: '100%', height: '100%', backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                                        No Image
                                    </div>
                                )}
                                {}
                                <div style={{
                                    position: 'absolute',
                                    bottom: '10px',
                                    right: '10px',
                                    backgroundColor: '#eff6ff',
                                    padding: '4px 12px',
                                    borderRadius: '20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                    border: '1px solid #bfdbfe'
                                }}>
                                    <Star size={16} fill="#fbbf24" color="#fbbf24" />
                                    <span style={{ fontWeight: 700, color: '#1e3a8a', fontSize: '0.9rem' }}>{Math.round(item.averageRating || 4)}</span>
                                </div>
                            </Link>

                            <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#001a4d', margin: 0, fontFamily: 'var(--font-heading)' }}>
                                    <Link to={`/product/${item._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                        {item.name}
                                    </Link>
                                </h3>

                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.2rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.8rem' }}>
                                        <span style={{ fontSize: '1rem', color: '#9ca3af', textDecoration: 'line-through', fontWeight: 500 }}>₹{Math.round(item.price * 1.25)}</span>
                                        <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#3b82f6', letterSpacing: '-0.5px' }}>₹{item.price}</span>
                                    </div>
                                </div>

                                <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
                                    <button
                                        onClick={() => handleBuyNow(item)}
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            borderRadius: '6px',
                                            fontSize: '0.9rem',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            border: 'none',
                                            backgroundColor: '#1a1a1a',
                                            color: 'white',
                                            textTransform: 'uppercase'
                                        }}
                                    >
                                        Buy Now
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Wishlist;
