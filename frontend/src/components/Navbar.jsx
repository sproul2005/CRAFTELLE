import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, User, Menu, X, LogOut, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import api from '../services/api';

const Navbar = () => {
    const { user, logout, isAdmin } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); 
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false); 
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
    const location = useLocation();

    const { cartTotal, cartItems } = useCart(); // Get cart total
    const { wishlistItems } = useWishlist();

    const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    // Close dropdowns when location changes
    React.useEffect(() => {
        setIsMobileMenuOpen(false);
        setIsUserDropdownOpen(false);
        setSearchQuery('');
        setSearchResults([]);
        setIsSearchFocused(false);
        setIsMobileSearchOpen(false);
    }, [location]);

    // Handle search input changes
    React.useEffect(() => {
        const fetchSearchResults = async () => {
            if (searchQuery.trim().length > 1) {
                try {
                    const { data } = await api.get(`/products?keyword=${encodeURIComponent(searchQuery)}&limit=5`);
                    setSearchResults(data.products || []);
                } catch (error) {
                    console.error("Search failed:", error);
                }
            } else {
                setSearchResults([]);
            }
        };

        const debounceTimer = setTimeout(fetchSearchResults, 300);
        return () => clearTimeout(debounceTimer);
    }, [searchQuery]);

    const navLinks = [
        { name: 'Home', path: '/' },
        
        
        { name: 'About Us', path: '/#about-us' },
        { name: 'Contact Us', path: '/#contact-us' }, 
    ];

    if (isAdmin) {
        navLinks.push({ name: 'Dashboard', path: '/admin/dashboard' });
        
        
    }



    return (
        <nav style={{
            padding: '1.0rem 0',
            position: 'sticky',
            top: 0,
            backgroundColor: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)',
            zIndex: 1000,
            borderBottom: '1px solid #f0f0f0'
        }}>
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {}
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
                    {}
                    {}
                    <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.5px', color: '#333' }}>
                        Hasthkala
                    </span>
                </Link>

                {}
                <div style={{ flex: 1, maxWidth: '400px', margin: '0 2rem', position: 'relative' }} className="desktop-search">
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        backgroundColor: '#f3f4f6',
                        borderRadius: '20px',
                        padding: '6px 16px',
                        border: isSearchFocused ? '1px solid var(--color-primary)' : '1px solid transparent',
                        transition: 'all 0.2s'
                    }}>
                        <Search size={18} color="#6b7280" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => setIsSearchFocused(true)}
                            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)} 
                            style={{
                                border: 'none',
                                background: 'none',
                                outline: 'none',
                                padding: '4px 8px',
                                width: '100%',
                                fontSize: '0.9rem',
                                color: '#1f2937'
                            }}
                        />
                    </div>

                    {}
                    <AnimatePresence>
                        {isSearchFocused && searchQuery.trim().length > 1 && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                style={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: 0,
                                    right: 0,
                                    backgroundColor: 'white',
                                    marginTop: '8px',
                                    borderRadius: '8px',
                                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                                    border: '1px solid #e5e7eb',
                                    overflow: 'hidden',
                                    zIndex: 1002
                                }}
                            >
                                {searchResults.length > 0 ? (
                                    <div>
                                        {searchResults.map((product) => (
                                            <Link
                                                key={product._id}
                                                to={`/product/${product._id}`}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '10px',
                                                    padding: '10px 15px',
                                                    textDecoration: 'none',
                                                    color: '#374151',
                                                    borderBottom: '1px solid #f3f4f6',
                                                    transition: 'background-color 0.2s'
                                                }}
                                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                                            >
                                                <div style={{ width: '40px', height: '40px', backgroundColor: '#f3f4f6', flexShrink: 0, borderRadius: '4px', overflow: 'hidden' }}>
                                                    {product.images && product.images.length > 0 ? (
                                                        <img src={product.images[0].url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} referrerPolicy="no-referrer" />
                                                    ) : (
                                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#9ca3af' }}>No Img</div>
                                                    )}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 500, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '280px' }}>{product.name}</div>
                                                    <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>₹{product.price}</div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{ padding: '15px', textAlign: 'center', color: '#6b7280', fontSize: '0.9rem' }}>
                                        No products found for "{searchQuery}"
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {}
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }} className="desktop-menu">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            to={link.path}
                            style={{
                                color: location.pathname === link.path && link.path !== '#' ? 'var(--color-primary)' : '#555',
                                fontWeight: location.pathname === link.path && link.path !== '#' ? 600 : 400,
                                fontSize: '0.95rem',
                                transition: 'color 0.2s',
                                textDecoration: 'none'
                            }}
                        >
                            {link.name}
                        </Link>
                    ))}

                    {}
                    {user ? (
                        <div style={{ position: 'relative' }}>
                            <button
                                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '0.95rem',
                                    color: '#555',
                                    padding: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px'
                                }}
                            >
                                <User size={18} />
                                <span>My Account</span>
                            </button>
                            {}
                            {isUserDropdownOpen && (
                                <div style={{
                                    position: 'absolute',
                                    top: '150%',
                                    right: 0,
                                    backgroundColor: 'white',
                                    boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                    minWidth: '150px',
                                    zIndex: 1001,
                                    border: '1px solid #eee'
                                }}>
                                    <div style={{ padding: '10px 15px', borderBottom: '1px solid #eee', fontSize: '0.85rem', color: '#888' }}>
                                        Hello, {user.name}
                                    </div>
                                    <Link to="/profile" onClick={() => setIsUserDropdownOpen(false)} style={{ display: 'block', padding: '10px 15px', color: '#333', textDecoration: 'none', fontSize: '0.9rem' }}>
                                        My Profile
                                    </Link>
                                    <button
                                        onClick={() => { logout(); setIsUserDropdownOpen(false); }}
                                        style={{ width: '100%', textAlign: 'left', padding: '10px 15px', background: 'none', border: 'none', color: 'red', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}
                                    >
                                        <LogOut size={14} /> Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link to="/login" style={{ fontSize: '0.95rem', color: '#555', textDecoration: 'none' }}>
                            Login
                        </Link>
                    )}

                    {}
                    {!isAdmin && (
                        <Link to="/wishlist" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'var(--color-primary)', fontWeight: 600 }}>
                            <div style={{ position: 'relative', display: 'flex' }}>
                                <Heart size={24} fill="none" color="#333" strokeWidth={1.5} />
                                {wishlistItems.length > 0 && (
                                    <span style={{
                                        position: 'absolute',
                                        top: -5,
                                        right: -8,
                                        background: 'var(--color-primary)',
                                        color: 'white',
                                        fontSize: '0.7rem',
                                        minWidth: '18px',
                                        height: '18px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: '50%',
                                        fontWeight: 'bold'
                                    }}>
                                        {wishlistItems.length}
                                    </span>
                                )}
                            </div>
                        </Link>
                    )}
                </div>

                {}
                <div className="mobile-icons" style={{ display: 'none', alignItems: 'center', gap: '1rem' }}>
                    <button onClick={() => { setIsMobileSearchOpen(!isMobileSearchOpen); setIsMobileMenuOpen(false); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: 'var(--color-primary)' }}>
                        <Search size={24} />
                    </button>
                    <button onClick={() => { toggleMenu(); setIsMobileSearchOpen(false); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: 'var(--color-primary)' }}>
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {}
            <AnimatePresence>
                {isMobileSearchOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{
                            overflow: 'hidden',
                            backgroundColor: 'white',
                            borderBottom: '1px solid #eee'
                        }}
                    >
                        <div style={{ padding: '15px' }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                backgroundColor: '#f3f4f6',
                                borderRadius: '20px',
                                padding: '8px 16px',
                            }}>
                                <Search size={18} color="#6b7280" />
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    autoFocus
                                    style={{
                                        border: 'none',
                                        background: 'none',
                                        outline: 'none',
                                        padding: '4px 8px',
                                        width: '100%',
                                        fontSize: '0.95rem',
                                        color: '#1f2937'
                                    }}
                                />
                            </div>
                            {}
                            {searchQuery.trim().length > 1 && searchResults.length > 0 && (
                                <div style={{ marginTop: '10px', maxHeight: '60vh', overflowY: 'auto' }}>
                                    {searchResults.map((product) => (
                                        <Link
                                            key={product._id}
                                            to={`/product/${product._id}`}
                                            onClick={() => setIsMobileSearchOpen(false)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px',
                                                padding: '10px 0',
                                                textDecoration: 'none',
                                                color: '#374151',
                                                borderBottom: '1px solid #f3f4f6',
                                            }}
                                        >
                                            <div style={{ width: '40px', height: '40px', backgroundColor: '#f3f4f6', flexShrink: 0, borderRadius: '4px', overflow: 'hidden' }}>
                                                {product.images && product.images.length > 0 ? (
                                                    <img src={product.images[0].url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} referrerPolicy="no-referrer" />
                                                ) : (
                                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#9ca3af' }}>No Img</div>
                                                )}
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontWeight: 500, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</div>
                                                <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>₹{product.price}</div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                            {searchQuery.trim().length > 1 && searchResults.length === 0 && (
                                <div style={{ padding: '15px', textAlign: 'center', color: '#6b7280', fontSize: '0.9rem' }}>
                                    No products found for "{searchQuery}"
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{
                            overflow: 'hidden',
                            backgroundColor: 'white',
                            borderBottom: '1px solid #eee'
                        }}
                    >
                        <div style={{ display: 'flex', flexDirection: 'column', padding: '1rem 2rem', gap: '1rem' }}>
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    onClick={toggleMenu}
                                    style={{
                                        fontSize: '1rem',
                                        color: '#333',
                                        textDecoration: 'none'
                                    }}
                                >
                                    {link.name}
                                </Link>
                            ))}
                            {!isAdmin && (
                                <Link to="/wishlist" onClick={toggleMenu} style={{ fontSize: '1rem', color: '#333', textDecoration: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    Wishlist
                                    {wishlistItems.length > 0 && (
                                        <span style={{ background: 'var(--color-primary)', color: 'white', padding: '2px 8px', borderRadius: '10px', fontSize: '0.8rem' }}>
                                            {wishlistItems.length} items
                                        </span>
                                    )}
                                </Link>
                            )}
                            {user ? (
                                <>
                                    <Link to="/profile" onClick={toggleMenu} style={{ fontSize: '1rem', color: '#333', textDecoration: 'none' }}>
                                        My Account
                                    </Link>
                                    <button onClick={() => { logout(); toggleMenu(); }} style={{ textAlign: 'left', background: 'none', border: 'none', color: 'red', fontSize: '1rem' }}>
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <Link to="/login" onClick={toggleMenu} style={{ fontSize: '1rem', color: '#333', textDecoration: 'none' }}>
                                    Login
                                </Link>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            <style>{`
                @media (max-width: 768px) {
                    .desktop-search {
                        display: none !important;
                    }
                    .mobile-icons {
                        display: flex !important;
                    }
                    .mobile-toggle {
                        display: none !important;
                    }
                }
            `}</style>
        </nav>
    );
};

export default Navbar;
