import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Filter, Search, Heart, Star } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { getOptimizedUrl } from '../utils/imageUtils';

const Shop = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState('');
    const navigate = useNavigate();
    const { addToWishlist: addProductToWishlist } = useWishlist();

    const handleAddToWishlist = (e, product) => {
        e.preventDefault();
        const success = addProductToWishlist(product);
        if (success) {
            alert("Added to Wishlist!");
        }
    };

    const handleBuyNow = (e, product) => {
        e.preventDefault();
        const defaultSize = product.sizes && product.sizes.length > 0 ? product.sizes[0].label : '';
        navigate('/checkout', {
            state: { product, selectedSize: defaultSize, quantity: 1 }
        });
    };



    const [availableCategories, setAvailableCategories] = useState([]);

    const allowedCategories = ['Anniversary', 'Marriage', 'Birthday', 'Baby Details', 'Gifts', 'Nameplate', 'Clock', 'Bangles', 'Resin Art', 'String Art', 'Candles', 'Rakhi'];

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { data } = await api.get('/products/categories');
                const existingCategories = data.categories || [];

                const filtered = allowedCategories.filter(c => existingCategories.includes(c));
                setAvailableCategories(filtered);
            } catch (error) {
                console.error("Failed to load categories", error);
            }
        };
        fetchCategories();
    }, []);


    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                let query = '/products?limit=1000';
                if (category) query += `&category=${category}`;

                const { data } = await api.get(query);
                setProducts(data.products || []);
            } catch (error) {
                console.error("Failed to fetch products", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [category]);

    return (
        <div className="container" style={{ paddingTop: '1rem', paddingBottom: '4rem' }}>
            <style>{`
                .product-info {
                    padding: 0.8rem;
                    gap: 0.3rem;
                }
                .product-title {
                    font-size: 0.9rem;
                    font-weight: 600;
                    color: #001a4d;
                    margin: 0;
                    font-family: var(--font-heading);
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .product-price-old {
                    font-size: 0.8rem;
                    color: #9ca3af;
                    text-decoration: line-through;
                    font-weight: 500;
                }
                .product-price-new {
                    font-size: 1rem;
                    font-weight: 800;
                    color: #3b82f6;
                    letter-spacing: -0.5px;
                }
                .product-actions {
                    display: flex;
                    gap: 5px;
                    margin-top: 0.5rem;
                }
                .buy-now-btn {
                    flex: 1;
                    padding: 8px 5px;
                    border-radius: 6px;
                    font-size: 0.8rem;
                    font-weight: 600;
                    cursor: pointer;
                    border: none;
                    background-color: #1a1a1a;
                    color: white;
                    text-transform: uppercase;
                }
                .wishlist-btn {
                    width: 35px;
                    height: 35px;
                    padding: 0;
                    border-radius: 6px;
                    font-size: 0.8rem;
                    font-weight: 600;
                    cursor: pointer;
                    border: 1px solid #1a1a1a;
                    background-color: transparent;
                    color: #1a1a1a;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .wishlist-text {
                    display: none;
                }
                .product-img-link {
                    height: 160px;
                }

                @media (min-width: 600px) {
                    .product-info { padding: 1rem; gap: 0.4rem; }
                    .product-title { font-size: 1.2rem; -webkit-line-clamp: unset; white-space: nowrap; }
                    .product-price-old { font-size: 1rem; }
                    .product-price-new { font-size: 1.4rem; }
                    .product-actions { gap: 10px; margin-top: auto; }
                    .buy-now-btn { padding: 10px; font-size: 0.9rem; }
                    .wishlist-btn { width: auto; height: auto; flex: 1; padding: 10px; font-size: 0.9rem; gap: 5px; }
                    .wishlist-text { display: inline; text-transform: uppercase; font-weight: 600; font-size: 0.9rem; }
                    .product-img-link { height: 250px; }
                }

                .product-grid {
                    grid-template-columns: repeat(2, 1fr); /* Mobile: 2 columns */
                    gap: 12px;
                }
                @media (min-width: 640px) {
                    .product-grid {
                        grid-template-columns: repeat(2, 1fr);
                        gap: 2rem;
                    }
                }
                @media (min-width: 1024px) {
                    .product-grid {
                        grid-template-columns: repeat(4, 1fr); /* Desktop: 4 columns strictly */
                        gap: 2rem;
                    }
                }
            `}</style>

            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <h1 style={{ fontSize: '2.5rem' }}>Collection</h1>

                { }
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ position: 'relative' }}>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            style={{
                                padding: '10px 15px',
                                borderRadius: '0',
                                border: '1px solid var(--color-accent)',
                                fontFamily: 'var(--font-body)',
                                appearance: 'none',
                                paddingRight: '2rem',
                                minWidth: '150px'
                            }}
                        >
                            <option value="">All Categories</option>
                            {availableCategories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <Filter size={16} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    </div>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem' }}>Loading masterpieces...</div>
            ) : (
                <div className="product-grid" style={{ display: 'grid', gap: '2rem' }}>
                    {products.map((product) => (
                        <motion.div
                            key={product._id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                            style={{
                                border: '1px solid #f0f0f0',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                backgroundColor: 'white',
                                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                            whileHover={{ y: -5, boxShadow: '0 10px 20px rgba(0,0,0,0.08)' }}
                        >
                            <Link to={`/product/${product._id}`} className="product-img-link" style={{ display: 'block', overflow: 'hidden', position: 'relative' }}>
                                {product.images && product.images.length > 0 ? (
                                    <img
                                        src={getOptimizedUrl(product.images[0].url)}
                                        alt={product.name}
                                        loading="lazy"
                                        referrerPolicy="no-referrer"
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                                        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                    />
                                ) : (
                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9f9f9', color: '#ccc' }}>No Image</div>
                                )}
                                { }
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
                                    <span style={{ fontWeight: 700, color: '#1e3a8a', fontSize: '0.9rem' }}>{Math.round(product.averageRating || 4)}</span>
                                </div>
                            </Link>

                            <div className="product-info" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <h3 className="product-title">
                                    <Link to={`/product/${product._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                        {product.name}
                                    </Link>
                                </h3>

                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.2rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.8rem' }}>
                                        <span className="product-price-old">₹{Math.round(product.price * 1.25)}</span>
                                        <span className="product-price-new">₹{product.price}</span>
                                    </div>
                                </div>

                                <div className="product-actions">
                                    <button
                                        onClick={(e) => handleBuyNow(e, product)}
                                        className="buy-now-btn"
                                    >
                                        BUY NOW
                                    </button>
                                    <button
                                        onClick={(e) => handleAddToWishlist(e, product)}
                                        className="wishlist-btn"
                                        onMouseOver={(e) => {
                                            e.currentTarget.style.backgroundColor = '#f5f5f5';
                                        }}
                                        onMouseOut={(e) => {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                        }}
                                    >
                                        <Heart size={16} /> <span className="wishlist-text">WISHLIST</span>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {!loading && products.length === 0 && (
                <p style={{ textAlign: 'center', marginTop: '4rem' }}>No products found in this category.</p>
            )}
        </div>
    );
};
export default Shop;
