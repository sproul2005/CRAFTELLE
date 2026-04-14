import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ChevronLeft, ChevronRight, Star, Heart } from 'lucide-react';
import { getOptimizedUrl } from '../utils/imageUtils';

const RelatedProducts = ({ currentProductId }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const scrollRef = React.useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRelatedProducts = async () => {
            try {
                const response = await api.get('/products?limit=1000');
                const allProducts = response.data.products || [];
                
                const filteredProducts = allProducts.filter(p => p._id !== currentProductId);

                const grouped = {};
                filteredProducts.forEach(p => {
                    const cat = p.category || 'Other';
                    if (!grouped[cat]) grouped[cat] = [];
                    grouped[cat].push(p);
                });

                Object.keys(grouped).forEach(cat => {
                    grouped[cat].sort(() => 0.5 - Math.random());
                });

                const interleaved = [];
                let added = true;
                const categoryKeys = Object.keys(grouped).sort(() => 0.5 - Math.random());
                
                while (added) {
                    added = false;
                    for (const cat of categoryKeys) {
                        if (grouped[cat].length > 0) {
                            interleaved.push(grouped[cat].shift());
                            added = true;
                        }
                    }
                }

                setProducts(interleaved);
            } catch (error) {
                console.error("Failed to fetch related products", error);
            } finally {
                setLoading(false);
            }
        };

        if (currentProductId) {
            fetchRelatedProducts();
        }
    }, [currentProductId]);

    const scroll = (direction) => {
        if (scrollRef.current) {
            const scrollAmount = direction === 'left' ? -300 : 300;
            scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    if (loading || products.length === 0) return null;

    return (
        <div style={{ paddingTop: '0', marginTop: '0' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.5rem', textAlign: 'center' }}>
                <h2 style={{ fontSize: 'clamp(1.8rem, 8vw, 2.2rem)', margin: '0 0 0.2rem 0', color: '#1f2937', fontWeight: 800, letterSpacing: '-0.5px', lineHeight: '1.1' }}>Recommended <br style={{ display: 'none' }} className="mobile-break" />Products</h2>
                <p style={{ fontSize: 'clamp(1rem, 4vw, 1.2rem)', margin: 0, color: '#4b5563' }}>You may also like</p>
                <style>{`@media (max-width: 480px) { .mobile-break { display: block !important; } }`}</style>
            </div>

            <div
                ref={scrollRef}
                style={{
                    display: 'flex',
                    gap: '1.5rem',
                    overflowX: 'auto',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    paddingBottom: '1rem'
                }}
            >
                {products.map(product => (
                    <div
                        key={product._id}
                        onClick={() => navigate(`/product/${product._id}`)}
                        style={{
                            minWidth: 'clamp(160px, 45vw, 280px)',
                            maxWidth: 'clamp(160px, 45vw, 280px)',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            border: '1px solid #f1f5f9',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            backgroundColor: 'white'
                        }}
                    >
                        <div style={{ width: '100%', height: '240px', backgroundColor: '#f3f4f6', position: 'relative' }}>
                            {product.images?.[0] ? (
                                <img
                                    src={getOptimizedUrl(product.images[0].url, 300)}
                                    alt={product.name}
                                    loading="lazy"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
                                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                />
                            ) : (
                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>No Image</div>
                            )}
                            <button
                                onClick={(e) => { e.stopPropagation();  }}
                                style={{
                                    position: 'absolute',
                                    bottom: '10px',
                                    right: '10px',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    filter: 'drop-shadow(0px 1px 3px rgba(0,0,0,0.5))'
                                }}
                            >
                                <Heart size={20} color="white" strokeWidth={2.5} style={{ opacity: 0.9 }} />
                            </button>
                        </div>
                        <div style={{ padding: '1.2rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', flex: 1, justifyContent: 'center' }}>
                            <h3 style={{ fontSize: 'clamp(1rem, 3.5vw, 1.15rem)', margin: '0 0 0.8rem 0', color: '#2c3e50', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%', textAlign: 'center', fontFamily: 'serif' }}>
                                {product.name}
                            </h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center', width: '100%', whiteSpace: 'nowrap' }}>
                                <span style={{ fontSize: 'clamp(0.85rem, 2.5vw, 1rem)', color: '#9ca3af', textDecoration: 'line-through' }}>
                                    Rs. {Math.round(product.price * 1.25).toLocaleString()}
                                </span>
                                <span style={{ fontSize: 'clamp(0.95rem, 3vw, 1.1rem)', fontWeight: 800, color: '#111' }}>
                                    Rs. {product.price.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {}
            <style>{`
                div::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    );
};

export default React.memo(RelatedProducts);
