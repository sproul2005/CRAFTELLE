import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import api from '../services/api';
import { MessageCircle, Sparkles, X, ChevronDown, Package, Settings, PenTool, CheckCircle, Heart, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getOptimizedUrl } from '../utils/imageUtils';

const Home = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();
    const [category, setCategory] = useState(() => {
        const urlCategory = searchParams.get('category');
        return urlCategory ? urlCategory : 'featured';
    });

    const { addToCart } = useCart();
    const { addToWishlist: addProductToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    const { isAdmin } = useAuth();
    const navigate = useNavigate();

    // Sync URL category changes
    useEffect(() => {
        const urlCategory = searchParams.get('category') || 'featured';
        if (urlCategory !== category) {
            setCategory(urlCategory);
        }
    }, [searchParams]);

    const handleCategoryClick = (c) => {
        setCategory(c);
        if (c === 'featured') {
            searchParams.delete('category');
        } else {
            searchParams.set('category', c);
        }
        setSearchParams(searchParams, { replace: true });
    };

    const handleAddToWishlist = (e, product) => {
        e.preventDefault();
        if (isInWishlist(product._id)) {
            removeFromWishlist(product._id);
        } else {
            const success = addProductToWishlist(product);
            if (success) {
                alert("Added to Wishlist!");
            }
        }
    };

    const handleBuyNow = (e, product) => {
        e.preventDefault();
        const defaultSize = product.sizes && product.sizes.length > 0 ? product.sizes[0].label : '';
        navigate('/checkout', {
            state: { product, selectedSize: defaultSize, quantity: 1 }
        });
    };


    const location = useLocation();

    React.useEffect(() => {
        if (location.hash) {
            const element = document.getElementById(location.hash.substring(1));
            if (element) {
                setTimeout(() => {
                    element.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }
        }
    }, [location]);


    const allowedCategories = ['Anniversary', 'Marriage', 'Birthday', 'Baby Details', 'Gifts', 'Nameplate', 'Clock', 'Bangles', 'Resin Art', 'String Art', 'Candles', 'Rakhi'];

    const categoryImages = {
        'Anniversary': '/categories/anniversary.png',
        'Marriage': 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=200&q=80',
        'Birthday': 'https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=200&q=80',
        'Baby Details': 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=200&q=80',
        'Gifts': 'https://images.unsplash.com/photo-1512909006721-3d6018887383?w=200&q=80',
        'Nameplate': '/categories/nameplate.png',
        'Clock': 'https://images.unsplash.com/photo-1501139083538-0139583c060f?w=200&q=80',
        'Bangles': 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=200&q=80',
        'Resin Art': 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=200&q=80',
        'String Art': 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=200&q=80',
        'Candles': 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=200&q=80',
        'Rakhi': 'https://images.unsplash.com/photo-1600812140131-01648a7ebdf4?w=200&q=80',
    };

    const [availableCategories, setAvailableCategories] = useState([]);

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
                let query = '/products?limit=100';
                if (category === 'featured') {
                    query = '/products?trending=true&limit=8';
                } else if (category) {
                    query = `/products?category=${category}&limit=100`;
                }

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
        <div style={{ overflowX: 'hidden' }}>
            <Helmet>
                <title>Craftelle</title>
                <meta name="description" content="Celebrate life's special moments with personalized, handcrafted creations like Resin Art, Clocks, Nameplates, and custom keepsakes that turn memories into timeless treasures." />
                <meta property="og:title" content="Craftelle | Handmade & Personalized Gifts" />
                <meta property="og:description" content="Turn Your Memories Into Timeless Treasures. Premium personalized and handmade gifts." />
            </Helmet>
            { }
            <div style={{
                position: 'relative',
                height: '95vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                color: 'white',
                marginBottom: '0rem',
                overflow: 'hidden',
                marginTop: '-2rem'
            }}>
                { }
                <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundImage: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.75)), url("https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=3432&auto=format&fit=crop")',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }}></motion.div>

                { }
                <div style={{ position: 'relative', zIndex: 1, padding: '0 1rem', maxWidth: '900px' }}>
                    <motion.h4
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        style={{
                            textTransform: 'uppercase',
                            letterSpacing: '3px',
                            fontSize: '1rem',
                            marginBottom: '1rem',
                            color: '#e0e0e0'
                        }}
                    >
                        The Art of Thoughtful Gifting
                    </motion.h4>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        style={{
                            fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
                            fontFamily: 'var(--font-heading)',
                            lineHeight: '1.2',
                            marginBottom: '1.5rem',
                            fontWeight: 400
                        }}
                    >
                        Turn Your Memories Into <br />
                        <span style={{ fontWeight: 600 }}>Timeless Treasures</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        style={{
                            fontSize: '1.1rem',
                            maxWidth: '600px',
                            margin: '0 auto 2.5rem',
                            color: '#eee',
                            lineHeight: '1.6'
                        }}
                    >
                        Celebrate life’s special moments with personalized, handcrafted creations that tell your unique story and turn memories into something truly meaningful.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}
                    >
                        <button
                            onClick={() => document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' })}
                            className="btn-primary"
                            style={{
                                padding: '15px 40px',
                                borderRadius: '30px',
                                fontSize: '1rem',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}
                        >
                            Explore Collection
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        </button>
                        <span style={{ fontSize: '0.9rem', color: '#e0e0e0', opacity: 0.9, letterSpacing: '0.5px' }}>
                            Handcrafted with ❤️ | Unique & Personalized
                        </span>
                    </motion.div>
                </div>

                { }
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2, duration: 1 }}
                    style={{ position: 'absolute', bottom: '30px', left: '50%', transform: 'translateX(-50%)' }}
                >
                    <div style={{ width: '30px', height: '50px', border: '2px solid rgba(255,255,255,0.3)', borderRadius: '15px', display: 'flex', justifyContent: 'center', paddingTop: '10px' }}>
                        <motion.div
                            animate={{ y: [0, 15, 0] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                            style={{ width: '4px', height: '4px', background: 'white', borderRadius: '50%' }}
                        />
                    </div>
                </motion.div>
            </div>

            <div id="products-section" className="container" style={{ padding: '0.5rem 1.5rem', minHeight: '600px' }}>

                { }
                <div style={{ marginBottom: '0', display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                    <h2 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-heading)', marginTop: '0.5rem', marginBottom: '0.5rem' }}>Curated For You</h2>
                </div>

                { }
                <div className="category-bubbles" style={{ margin: '0 -1.5rem 1.5rem', padding: '0.5rem 1.5rem', overflowX: 'auto', WebkitOverflowScrolling: 'touch', textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', gap: '2.5rem', margin: '0 auto', padding: '0 1rem' }}>
                        <div
                            onClick={() => handleCategoryClick('featured')}
                            style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer',
                                opacity: category === 'featured' ? 1 : 0.6,
                                transform: category === 'featured' ? 'scale(1.05)' : 'scale(1)',
                                transition: 'all 0.3s'
                            }}>
                            <div style={{ width: '70px', height: '70px', borderRadius: '50%', backgroundColor: 'var(--color-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: category === '' ? '0 0 0 2px var(--color-primary)' : '0 2px 10px rgba(0,0,0,0.05)' }}>
                                <Sparkles size={24} color="var(--color-primary)" />
                            </div>
                            <span style={{ fontSize: '0.85rem', fontWeight: category === 'featured' ? 600 : 400 }}>Trending</span>
                        </div>
                        {availableCategories.map(c => (
                            <div
                                key={c}
                                onClick={() => handleCategoryClick(c)}
                                style={{
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer',
                                    opacity: category === c ? 1 : 0.6,
                                    transform: category === c ? 'scale(1.05)' : 'scale(1)',
                                    transition: 'all 0.3s'
                                }}>
                                <div style={{
                                    width: '70px', height: '70px', borderRadius: '50%',
                                    backgroundImage: `url(${categoryImages[c] || 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=200&q=80'})`,
                                    backgroundSize: 'cover',
                                    boxShadow: category === c ? '0 0 0 2px var(--color-primary)' : '0 2px 10px rgba(0,0,0,0.05)'
                                }}></div>
                                <span style={{ fontSize: '0.85rem', fontWeight: category === c ? 600 : 400 }}>{c}</span>
                            </div>
                        ))}
                    </div>
                </div>

                { }
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '4rem' }}>Loading masterpieces...</div>
                ) : (
                    <div className="product-grid" style={{
                        display: 'grid'
                    }}>
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
                                <Link to={`/product/${product._id}`} state={{ fromCategory: category }} className="product-img-link" style={{ display: 'block', overflow: 'hidden', position: 'relative' }}>
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
                                        <Link to={`/product/${product._id}`} state={{ fromCategory: category }} style={{ textDecoration: 'none', color: 'inherit' }}>
                                            {product.name}
                                        </Link>
                                    </h3>

                                    { }
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
                                            <Heart size={16} fill={isInWishlist(product._id) ? "#ef4444" : "none"} color={isInWishlist(product._id) ? "#ef4444" : "currentColor"} /> <span className="wishlist-text">WISHLIST</span>
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
                {!loading && products.length === 0 && (
                    <p style={{ textAlign: 'center', marginTop: '4rem' }}>No products found.</p>
                )}



                { }
                <div id="how-we-work" className="section" style={{ padding: 'clamp(2rem, 5vw, 4rem) 1rem', backgroundColor: '#fcfaf8', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ textAlign: 'center', marginBottom: 'clamp(1rem, 4vw, 2rem)', marginTop: 'clamp(0.5rem, 2vw, 1rem)' }}>
                        <motion.span
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            style={{
                                textTransform: 'uppercase',
                                letterSpacing: '2px',
                                color: '#666',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                display: 'inline-block',
                                marginBottom: '0.5rem'
                            }}>
                            Our Process
                        </motion.span>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            style={{ fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', fontFamily: 'var(--font-heading)', color: '#1a1a1a', marginBottom: '0.5rem' }}>
                            How We <span style={{ fontStyle: 'italic', fontWeight: 300 }}>Work</span>
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            style={{ color: '#666', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
                            From your heartfelt intention to their doorstep, we make the journey of gifting seamless, personal, and magical.
                        </motion.p>
                    </div>

                    <div style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative' }}>
                        { }
                        <div className="process-line"></div>

                        <div className="process-grid" style={{
                            display: 'grid',
                            gap: '2rem',
                            position: 'relative',
                            zIndex: 1
                        }}>
                            {[
                                { id: '01', title: 'Choose', desc: 'Browse our exclusive collection to find the perfect heartfelt gift.', icon: <Package strokeWidth={1.5} size={28} /> },
                                { id: '02', title: 'Customize', desc: 'Share your personal preferences to make it truly yours.', icon: <Settings strokeWidth={1.5} size={28} /> },
                                { id: '03', title: 'Create', desc: 'We carefully handcraft your personalized gift with love.', icon: <PenTool strokeWidth={1.5} size={28} /> },
                                { id: '04', title: 'Deliver', desc: 'Fast, beautiful, and pristine delivery straight to their doorstep.', icon: <CheckCircle strokeWidth={1.5} size={28} /> }
                            ].map((step, index) => (
                                <motion.div
                                    key={step.id}
                                    initial={{ opacity: 0, y: 40 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.15, duration: 0.6, ease: "easeOut" }}
                                    style={{ textAlign: 'center', position: 'relative' }}
                                >
                                    <div style={{
                                        color: '#e5e5e5',
                                        fontSize: 'clamp(2.5rem, 6vw, 3.5rem)',
                                        fontWeight: 300,
                                        fontFamily: 'var(--font-heading)',
                                        lineHeight: 1,
                                        marginBottom: 'clamp(-1rem, -2vw, -1.5rem)',
                                        position: 'relative',
                                        zIndex: 0
                                    }}>{step.id}</div>

                                    <div className="process-icon-container" style={{
                                        width: 'clamp(60px, 10vw, 80px)',
                                        height: 'clamp(60px, 10vw, 80px)',
                                        backgroundColor: 'white',
                                        borderRadius: '50%',
                                        margin: '0 auto clamp(0.5rem, 2vw, 1rem)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
                                        border: '1px solid #f0f0f0',
                                        color: '#1a1a1a',
                                        position: 'relative',
                                        zIndex: 1,
                                        transition: 'all 0.4s ease'
                                    }}>
                                        {step.icon}
                                    </div>

                                    <h3 style={{ fontSize: '1.3rem', fontWeight: 500, marginBottom: '0.4rem', color: '#1a1a1a', fontFamily: 'var(--font-heading)' }}>{step.title}</h3>
                                    <p style={{ fontSize: '0.95rem', color: '#666', lineHeight: '1.5', padding: '0 10px', margin: 0 }}>{step.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>



                { }
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    id="about-us" className="section" style={{ textAlign: 'center', padding: 'clamp(2rem, 6vw, 4rem) 1rem', borderTop: '1px solid #eee' }}
                >
                    <h2 style={{ fontSize: 'clamp(2rem, 5vw, 2.5rem)', marginBottom: 'clamp(1rem, 3vw, 1.5rem)', fontFamily: 'var(--font-heading)' }}>Our Story</h2>
                    <div style={{ maxWidth: '800px', margin: '0 auto', lineHeight: '1.8', fontSize: 'clamp(1rem, 2vw, 1.1rem)', color: '#444' }}>
                        <p style={{ marginBottom: 'clamp(1rem, 3vw, 1.5rem)' }}>
                            Welcome to <strong>Craftelle</strong>, where the joy of gifting meets contemporary elegance.
                            Born from a passion for bringing smiles to people's faces, we curate a collection of personalized, soulful gifts that tell a beautiful story.
                        </p>
                        <p style={{ marginBottom: 'clamp(1rem, 3vw, 1.5rem)' }}>
                            Our artisans pour their heart into every creation—from personalized Resin Clocks to delicate String Art and customized Engagement Platters.
                            We believe that every occasion deserves to be celebrated, and every handcrafted piece should carry a piece of your heart.
                        </p>
                        <p>
                            Thank you for supporting handmade. Thank you for choosing quality, authenticity, and love.
                        </p>
                        <div style={{ marginTop: 'clamp(1.5rem, 4vw, 2rem)', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                            <span style={{ height: '2px', width: '50px', background: 'var(--color-secondary)' }}></span>
                        </div>
                    </div>
                </motion.div>

                { }
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                        gap: 'clamp(0.5rem, 2vw, 1rem)',
                        backgroundColor: 'var(--color-surface)',
                        padding: 'clamp(1rem, 3vw, 1.5rem)',
                        borderRadius: '8px',
                        maxWidth: '1200px',
                        margin: '0 auto'
                    }}
                >
                    { }
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-20px" }}
                        transition={{ delay: 0.1, duration: 0.5 }}
                        style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}
                    >
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
                        </div>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: 600, fontFamily: 'var(--font-heading)' }}>Standard Delivery</h3>
                        <p style={{ fontSize: '0.8rem', color: '#888' }}>7-12 Days Delivery</p>
                    </motion.div>

                    { }
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-20px" }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}
                    >
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>
                        </div>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: 600, fontFamily: 'var(--font-heading)' }}>Premium Quality</h3>
                        <p style={{ fontSize: '0.8rem', color: '#888' }}>Handcrafted Excellence</p>
                    </motion.div>

                    { }
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-20px" }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}
                    >
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                        </div>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: 600, fontFamily: 'var(--font-heading)' }}>Secure Payment</h3>
                        <p style={{ fontSize: '0.8rem', color: '#888' }}>100% Secure Checkout</p>
                    </motion.div>

                    { }
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-20px" }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                        style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}
                    >
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                        </div>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: 600, fontFamily: 'var(--font-heading)' }}>24/7 Support</h3>
                        <p style={{ fontSize: '0.8rem', color: '#888' }}>We're here to help</p>
                    </motion.div>
                </motion.div>

                <style>{`
                /* Process Grid */
                .process-grid {
                    grid-template-columns: 1fr;
                }
                .process-line {
                    display: none;
                }
                .process-icon-container:hover {
                    transform: translateY(-10px);
                    box-shadow: 0 15px 35px rgba(0,0,0,0.1) !important;
                    background-color: #1a1a1a !important;
                    color: white !important;
                }
                
                @media (min-width: 600px) {
                    .process-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }
                
                @media (min-width: 1024px) {
                    .process-grid {
                        grid-template-columns: repeat(4, 1fr);
                    }
                    .process-line {
                        display: block;
                        position: absolute;
                        top: 85px;
                        left: 10%;
                        width: 80%;
                        height: 1px;
                        border-top: 1px dashed #d0d0d0;
                        z-index: 0;
                    }
                }

                @media (min-width: 768px) {
                    .desktop-only { display: inline-block !important; }
                    .mobile-toggle-btn { display: none !important; }
                }
                
                /* Hide scrollbar for category bubbles but keep functionality */
                .category-bubbles::-webkit-scrollbar {
                    display: none;
                }
                .category-bubbles {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                
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

                /* Product Grid Layout */
                .product-grid {
                    grid-template-columns: repeat(2, 1fr); /* Mobile: 2 columns */
                    gap: 12px;
                }
                @media (min-width: 600px) {
                    .product-grid {
                        grid-template-columns: repeat(2, 1fr); /* Tablet: 2 columns */
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
            </div>

            { }
        </div>
    );
};

export default Home;
