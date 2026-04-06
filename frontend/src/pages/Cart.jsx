import React, { useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, Camera, ChevronRight } from 'lucide-react';

const Cart = () => {
    const { cartItems, removeDraft } = useCart();
    const navigate = useNavigate();

    useEffect(() => {
        if (cartItems.length === 0) {
            navigate('/');
        }
    }, [cartItems, navigate]);

    if (cartItems.length === 0) {
        return null; // The useEffect will handle the redirect
    }

    const handleRemove = (id) => {
        removeDraft(id);
        // Rely on the useEffect to redirect if the array becomes empty
    };

    const handleContinue = (draft) => {
        // Pass the draftId to checkout so it loads state
        navigate('/checkout', {
            state: { draftId: draft.id }
        });
    };

    return (
        <div className="container" style={{ minHeight: '80vh', paddingBottom: '4rem', paddingTop: '2rem' }}>
            <h1 style={{ marginBottom: '1rem', fontSize: 'clamp(2rem, 4vw, 2.5rem)', color: '#111' }}>Pending Orders</h1>
            <p style={{ color: '#6b7280', marginBottom: '2rem', fontSize: '1.1rem' }}>You have items waiting to be checked out.</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                {cartItems.map((draft, index) => {
                    const product = draft.product;
                    const sizeObj = product.sizes?.find(s => s.label === draft.selectedSize);
                    const price = (sizeObj && sizeObj.price > 0) ? sizeObj.price : product.price;

                    return (
                        <div key={draft.id || index} style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '1.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                            <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                <div style={{ width: '100px', height: '100px', background: '#f9fafb', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                                    {product.images?.[0] && <img src={product.images[0].url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={product.name} />}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', color: '#111' }}>{product.name}</h4>
                                    
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        {draft.selectedSize && <span style={{ color: '#4b5563', fontSize: '0.9rem', backgroundColor: '#f3f4f6', padding: '2px 8px', borderRadius: '4px' }}>Size: {draft.selectedSize}</span>}
                                        <span style={{ color: '#4b5563', fontSize: '0.9rem' }}>Qty: {draft.quantity}</span>
                                    </div>

                                    <div style={{ marginTop: '0.5rem', fontWeight: 700, fontSize: '1.1rem', color: '#111' }}>
                                        ₹{price * draft.quantity}
                                    </div>
                                </div>
                            </div>

                            {/* Summary of what has been filled out */}
                            <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', flex: 1 }}>
                                <h5 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Progress Saved</h5>
                                <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#334155', fontSize: '0.9rem', lineHeight: '1.6' }}>
                                    {draft.currentStep >= 2 && <li>Delivery Address details entered</li>}
                                    {draft.currentStep >= 3 && draft.customText && <li>Custom Text provided</li>}
                                    {draft.currentStep >= 3 && draft.customImages?.length > 0 && <li>{draft.customImages.length} Image(s) attached</li>}
                                    {draft.currentStep === 1 && <li>Just started (Order Summary)</li>}
                                </ul>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: 'auto' }}>
                                <button 
                                    onClick={() => handleRemove(draft.id)} 
                                    style={{ flex: 1, padding: '12px', background: 'white', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem' }}
                                >
                                    Remove
                                </button>
                                <button 
                                    onClick={() => handleContinue(draft)} 
                                    style={{ flex: 1.5, padding: '12px', background: '#111', border: 'none', color: 'white', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                                >
                                    Continue <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Cart;
