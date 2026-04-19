import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import { ShoppingBag, Truck, Camera, CreditCard, ChevronLeft, Upload, X, ShieldCheck, RefreshCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getOptimizedUrl } from '../utils/imageUtils';

const Checkout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { saveDraft, cartItems, removeDraft } = useCart();

    const { product, selectedSize, quantity, draftId } = location.state || {};

    // Prevent duplicate drafts per product:
    // If a draft for this product already exists and we didn't explicitly pass a draftId, find it.
    const existingDraftCheck = (product && !draftId) ? cartItems.find(d => d.product._id === product._id) : null;
    const resolvedDraftId = draftId || (existingDraftCheck ? existingDraftCheck.id : Date.now().toString());

    const [currentDraftId, setCurrentDraftId] = useState(resolvedDraftId);
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const [shippingAddress, setShippingAddress] = useState({
        fullName: user?.name || '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        phone: ''
    });

    const [customText, setCustomText] = useState('');
    const [customImages, setCustomImages] = useState([]);

    const stateInitialized = useRef(false);

    useEffect(() => {
        window.scrollTo(0, 0);
        if (!product && !draftId) {
            navigate('/shop');
            return;
        }

        // If resuming a draft (or found an existing one), initialize state from context
        if (resolvedDraftId && !stateInitialized.current) {
            const draft = cartItems.find(d => d.id === resolvedDraftId);
            if (draft) {
                if (draft.currentStep) setCurrentStep(draft.currentStep);
                if (draft.shippingAddress) setShippingAddress(draft.shippingAddress);
                if (draft.customText) setCustomText(draft.customText);
                if (draft.customImages) setCustomImages(draft.customImages);
            }
            stateInitialized.current = true;
        } else {
            stateInitialized.current = true; // Mark as initialized even if new
        }
    }, [product, draftId, resolvedDraftId, navigate, cartItems]);

    // Auto-save logic whenever user changes something or advances a step
    useEffect(() => {
        if (!stateInitialized.current) return; // Don't save before initial load
        
        let targetProduct = product;
        let targetSize = selectedSize;
        let targetQuantity = quantity;

        // If resuming, product data might only be in the draft
        if (!product && currentDraftId) {
            const draft = cartItems.find(d => d.id === currentDraftId);
            if (draft) {
                targetProduct = draft.product;
                targetSize = draft.selectedSize;
                targetQuantity = draft.quantity;
            }
        }

        if (targetProduct) {
            saveDraft({
                id: currentDraftId,
                product: targetProduct,
                selectedSize: targetSize,
                quantity: targetQuantity,
                currentStep,
                shippingAddress,
                customText,
                customImages
            });
        }
    }, [currentStep, shippingAddress, customText, customImages, currentDraftId, product, selectedSize, quantity, draftId]);

    // Derived product info depending on whether it's new or resumed
    const activeProduct = product || (currentDraftId ? cartItems.find(d => d.id === currentDraftId)?.product : null);
    const activeSize = selectedSize || (currentDraftId ? cartItems.find(d => d.id === currentDraftId)?.selectedSize : null);
    const activeQuantity = quantity || (currentDraftId ? cartItems.find(d => d.id === currentDraftId)?.quantity : 1);

    if (!activeProduct) return null;

    const sizeObj = activeProduct.sizes?.find(s => s.label === activeSize);
    const price = (sizeObj && sizeObj.price > 0) ? sizeObj.price : activeProduct.price;
    const totalAmount = price * activeQuantity;

    const handleAddressChange = (e) => {
        setShippingAddress({ ...shippingAddress, [e.target.name]: e.target.value });
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        if (customImages.length + files.length > 5) {
            alert("You can only upload a maximum of 5 images.");
            return;
        }
        setCustomImages([...customImages, ...files]);
    };

    const removeImage = (indexToRemove) => {
        setCustomImages(customImages.filter((_, index) => index !== indexToRemove));
    };

    const handleNextStep = () => {
        if (currentStep === 2) {
            const { fullName, address, city, state, pincode, phone } = shippingAddress;
            if (!fullName || !address || !city || !state || !pincode || !phone) {
                alert("Please fill in all delivery details.");
                return;
            }
        }
        
        if (currentStep === 2 && activeProduct.customizationType === 'none') {
            setCurrentStep(4);
            return;
        }
        
        if (currentStep === 3 && activeProduct.customizationType !== 'none') {
            if ((activeProduct.customizationType === 'text' || activeProduct.customizationType === 'both') && !customText.trim()) {
                alert("Please provide the custom text/name required for this product.");
                return;
            }
            if ((activeProduct.customizationType === 'photo' || activeProduct.customizationType === 'both') && customImages.length === 0) {
                alert("Please upload at least one photo for customization.");
                return;
            }
        }

        setCurrentStep(prev => prev + 1);
        window.scrollTo(0, 0);
    };

    const handlePlaceOrder = async () => {
        setLoading(true);

        try {
            let uploadedImageUrls = [];
            if (customImages.length > 0) {
                for (const img of customImages) {
                    // Try to catch invalid files (like empty objects from JSON parsing)
                    if (img instanceof File || img instanceof Blob) {
                        const formData = new FormData();
                        formData.append('image', img);
                        const res = await api.post('/upload', formData, {
                            headers: { 'Content-Type': 'multipart/form-data' }
                        });
                        uploadedImageUrls.push(res.data.url);
                    }
                }
            }

            const joinedImageUrls = uploadedImageUrls.join(',');

            const orderItems = [{
                product: activeProduct._id,
                name: activeProduct.name,
                image: activeProduct.images[0]?.url || '',
                price: price,
                quantity: activeQuantity,
                size: activeSize || '',
                customization: {
                    text: customText,
                    image: joinedImageUrls,
                    note: ''
                }
            }];

            const orderData = {
                orderItems,
                shippingAddress,
                paymentMethod: "Razorpay",
                itemsPrice: totalAmount,
                taxPrice: 0,
                shippingPrice: 0,
                totalPrice: totalAmount
            };

            let keyResponse;
            try {
                const res = await api.get('/payment/key');
                keyResponse = res.data;
            } catch (err) {
                console.warn('Razorpay key fetch failed:', err);
            }

            let rpOrderResponse;
            try {
                const res = await api.post('/payment/checkout', { amount: totalAmount });
                rpOrderResponse = res.data;
            } catch (err) {
                console.error('Razorpay creation failed:', err);
                alert('Payment gateway unreachable. Please try again later.');
                return;
            }

            const options = {
                key: keyResponse.key,
                amount: rpOrderResponse.order.amount,
                currency: "INR",
                name: "Craftelle",
                description: `Purchase of ${activeProduct.name}`,
                image: "https://res.cloudinary.com/craftelle/image/upload/v1/logo", 
                order_id: rpOrderResponse.order.id,
                handler: async function (response) {
                    try {
                        const { data: orderResponse } = await api.post('/orders/new', orderData);
                        const createdOrderId = orderResponse.order._id;

                        const verifyData = {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            orderId: createdOrderId
                        };
                        const { data: verifyResponse } = await api.post('/payment/verify', verifyData);
                        if (verifyResponse.success) {
                            alert('Payment successful!');
                            removeDraft(currentDraftId);
                            navigate('/my-orders');
                        }
                    } catch (err) {
                        alert("Payment verification or order creation failed! If deducted, contact support. Your draft is saved.");
                        navigate(`/product/${activeProduct._id}`);
                    }
                },
                prefill: {
                    name: shippingAddress.fullName,
                    email: user?.email || '',
                    contact: shippingAddress.phone
                },
                theme: { color: "#111111" },
                modal: {
                    ondismiss: function() {
                        alert("Payment was cancelled. Your progress has been saved in your cart.");
                        navigate(`/product/${activeProduct._id}`);
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response) {
                alert(`Payment Failed: ${response.error.description}. Your progress has been saved.`);
                navigate(`/product/${activeProduct._id}`);
            });
            rzp.open();

        } catch (error) {
            console.error('Checkout error:', error);
            alert(`Checkout failed. Please try again.`);
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        { id: 1, label: 'Order Summary', icon: <ShoppingBag size={18} /> },
        { id: 2, label: 'Delivery Details', icon: <Truck size={18} /> },
        { id: 3, label: 'Custom Details', icon: <Camera size={18} /> },
        { id: 4, label: 'Payment', icon: <CreditCard size={18} /> }
    ];

    const activeSteps = activeProduct.customizationType === 'none'
        ? steps.filter(s => s.id !== 3)
        : steps;

    return (
        <div style={{ backgroundColor: '#f4f7fc', minHeight: '100vh', paddingBottom: '3rem' }}>
            <div className="container" style={{ paddingTop: '2rem' }}>
                <style>{`
                    .premium-summary-card { background-color: #fff; border: 1px solid #e5e7eb; border-radius: 16px; padding: 2rem; margin-bottom: 2rem; box-shadow: 0 10px 30px rgba(0,0,0,0.03); display: flex; flexDirection: column; gap: 2rem; }
                    .summary-product-details { display: flex; gap: 1.5rem; align-items: stretch; }
                    .summary-img-container { width: 160px; flex-shrink: 0; }
                    .summary-img { width: 100%; aspect-ratio: 1/1; object-fit: cover; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.08); }
                    .summary-text-container { flex: 1; display: flex; flex-direction: column; gap: 0.5rem; }
                    .summary-title { font-size: 1.5rem; color: #111; font-family: var(--font-heading); margin: 0; line-height: 1.2; }
                    .summary-price { font-size: 1.8rem; font-weight: 800; color: #111; letter-spacing: -0.5px; margin-top: auto; }
                    .summary-badges { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 1rem; padding-top: 1.5rem; border-top: 1px solid #f3f4f6; }
                    @media (max-width: 640px) { .premium-summary-card { padding: 1.2rem; gap: 1.5rem; } .summary-product-details { gap: 1rem; } .summary-img-container { width: 100px; } .summary-img { border-radius: 8px; } .summary-title { font-size: 1.2rem; } .summary-price { font-size: 1.4rem; padding-top: 0.5rem; } .summary-badges { grid-template-columns: 1fr; gap: 0.8rem; } }
                `}</style>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <button onClick={() => navigate('/cart')} style={{ border: 'none', background: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#555', cursor: 'pointer', fontWeight: 500 }}>
                        <ChevronLeft size={16} /> Pause & View Cart
                    </button>
                    <span style={{ fontSize: '0.85rem', color: '#888', backgroundColor: '#e5e7eb', padding: '4px 10px', borderRadius: '15px' }}>Auto-saving progress</span>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontFamily: 'var(--font-heading)', color: '#001a4d', fontSize: 'clamp(2rem, 5vw, 2.5rem)', marginBottom: '0.5rem' }}>Complete Your Order</h1>
                    <p style={{ color: '#555', fontSize: '1.1rem' }}>Fill in your details and customize your order</p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', width: '100%', paddingBottom: '0.5rem' }}>
                    {activeSteps.map((step, index) => (
                        <React.Fragment key={step.id}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem', opacity: currentStep >= step.id ? 1 : 0.5, flex: 1, minWidth: '0' }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: currentStep >= step.id ? '#1d4ed8' : 'transparent', border: currentStep >= step.id ? 'none' : '2px solid #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: currentStep >= step.id ? 'white' : '#888' }}>
                                    {React.cloneElement(step.icon, { size: 14 })}
                                </div>
                                <span style={{ fontSize: 'clamp(0.65rem, 2vw, 0.85rem)', fontWeight: 500, color: currentStep >= step.id ? '#1d4ed8' : '#888', textAlign: 'center', lineHeight: '1.2' }}>{step.label}</span>
                            </div>
                            {index < activeSteps.length - 1 && <div style={{ flex: 1, height: '2px', backgroundColor: currentStep > activeSteps[index].id ? '#1d4ed8' : '#e5e7eb', margin: '0 0.2rem', marginBottom: '1.5rem', minWidth: '15px' }} />}
                        </React.Fragment>
                    ))}
                </div>

                <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                    <AnimatePresence mode='wait'>
                        <motion.div key={currentStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} style={{ padding: 'clamp(1.5rem, 4vw, 3rem)' }}>
                            {currentStep === 1 && (
                                <div>
                                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', fontSize: '1.5rem', color: '#002a4d' }}><ShoppingBag size={24} color="#1d4ed8" /> Order Summary</h2>
                                    <div className="premium-summary-card">
                                        <div className="summary-product-details">
                                            <div className="summary-img-container"><img src={getOptimizedUrl(activeProduct.images[0]?.url, 300)} loading="lazy" alt={activeProduct.name} className="summary-img" /></div>
                                            <div className="summary-text-container">
                                                <h3 className="summary-title">{activeProduct.name}</h3>
                                                <p style={{ color: '#6b7280', fontSize: '1rem', margin: 0 }}>{activeProduct.category}</p>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '0.5rem', alignItems: 'center' }}>
                                                    {activeSize && <span style={{ backgroundColor: '#f3f4f6', color: '#374151', padding: '0.4rem 1rem', borderRadius: '30px', fontSize: '0.85rem', fontWeight: 500 }}>Variant: {activeSize}</span>}
                                                    {activeProduct.customizationType === 'none' && <span style={{ color: '#4b5563', fontSize: '0.9rem', fontWeight: 500 }}>Qty: {activeQuantity}</span>}
                                                </div>
                                                <div className="summary-price">₹{totalAmount}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={handleNextStep} style={{ width: '100%', padding: '15px', backgroundColor: '#111', color: 'white', border: 'none', borderRadius: '6px', fontSize: '1.1rem', fontWeight: 600, cursor: 'pointer' }}>Continue to Delivery Address</button>
                                </div>
                            )}

                            {currentStep === 2 && (
                                <div>
                                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '1.5rem', color: '#002a4d' }}><Truck size={24} color="#1d4ed8" /> Delivery Address</h2>
                                    <div style={{ display: 'grid', gap: '0.8rem' }}>
                                        <div><label style={{ display: 'block', marginBottom: '0.2rem', fontWeight: 500, fontSize: '0.9rem', color: '#374151' }}>Full Name</label><input type="text" name="fullName" value={shippingAddress.fullName} onChange={handleAddressChange} style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }} /></div>
                                        <div><label style={{ display: 'block', marginBottom: '0.2rem', fontWeight: 500, fontSize: '0.9rem', color: '#374151' }}>Phone Number</label><input type="text" name="phone" value={shippingAddress.phone} onChange={handleAddressChange} style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }} /></div>
                                        <div><label style={{ display: 'block', marginBottom: '0.2rem', fontWeight: 500, fontSize: '0.9rem', color: '#374151' }}>Full Address</label><textarea name="address" value={shippingAddress.address} onChange={handleAddressChange} rows="2" style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}></textarea></div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                                            <div><label style={{ display: 'block', marginBottom: '0.2rem', fontWeight: 500, fontSize: '0.9rem', color: '#374151' }}>City</label><input type="text" name="city" value={shippingAddress.city} onChange={handleAddressChange} style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }} /></div>
                                            <div><label style={{ display: 'block', marginBottom: '0.2rem', fontWeight: 500, fontSize: '0.9rem', color: '#374151' }}>Pincode</label><input type="text" name="pincode" value={shippingAddress.pincode} onChange={handleAddressChange} style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }} /></div>
                                        </div>
                                        <div><label style={{ display: 'block', marginBottom: '0.2rem', fontWeight: 500, fontSize: '0.9rem', color: '#374151' }}>State</label><input type="text" name="state" value={shippingAddress.state} onChange={handleAddressChange} style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }} /></div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                        <button onClick={() => setCurrentStep(1)} style={{ width: '30%', padding: '12px', backgroundColor: 'transparent', color: '#4b5563', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer' }}>Go Back</button>
                                        <button onClick={handleNextStep} style={{ flex: 1, padding: '12px', backgroundColor: '#111', color: 'white', border: 'none', borderRadius: '6px', fontSize: '1.1rem', fontWeight: 600, cursor: 'pointer' }}>{activeProduct.customizationType === 'none' ? 'Proceed to Payment' : 'Proceed to Customization'}</button>
                                    </div>
                                </div>
                            )}

                            {currentStep === 3 && activeProduct.customizationType !== 'none' && (
                                <div>
                                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '1.5rem', color: '#002a4d' }}><Camera size={24} color="#1d4ed8" /> Custom Details</h2>
                                    <p style={{ color: '#6b7280', marginBottom: '1rem', fontSize: '0.95rem' }}>Make it yours. Provide exactly how you want it crafted.</p>
                                    {(activeProduct.customizationType === 'text' || activeProduct.customizationType === 'both') && (
                                        <div style={{ marginBottom: '1rem' }}><label style={{ display: 'block', marginBottom: '0.2rem', fontWeight: 500, fontSize: '0.9rem', color: '#374151' }}>Custom Text / Names</label><textarea value={customText} onChange={(e) => setCustomText(e.target.value)} rows="2" placeholder="Write exactly as you want it shown..." style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }} /></div>
                                    )}
                                    {(activeProduct.customizationType === 'photo' || activeProduct.customizationType === 'both') && (
                                        <div style={{ marginBottom: '1rem' }}>
                                            <label style={{ display: 'block', marginBottom: '0.2rem', fontWeight: 500, fontSize: '0.9rem', color: '#374151' }}>Upload Photos <span style={{ color: '#888', fontWeight: 'normal' }}>(Max 5 images. Will be lost on raw page reload)</span></label>
                                            <div style={{ border: '2px dashed #d1d5db', backgroundColor: '#f9fafb', borderRadius: '8px', padding: '1.5rem', textAlign: 'center' }}>
                                                <input type="file" multiple accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} id="checkout-image-upload" disabled={customImages.length >= 5} />
                                                <label htmlFor="checkout-image-upload" style={{ cursor: customImages.length >= 5 ? 'not-allowed' : 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}><Upload size={28} color="#1d4ed8" /><span style={{ fontWeight: 500, color: '#374151', fontSize: '0.95rem' }}>Click to Browse Files</span></label>
                                            </div>
                                            {customImages.length > 0 && (
                                                <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                                                    {customImages.map((img, idx) => (
                                                        <div key={idx} style={{ position: 'relative', width: '70px', height: '70px' }}>
                                                            {img instanceof File && <img src={URL.createObjectURL(img)} alt={`preview-${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px', border: '1px solid #ddd' }} />}
                                                            <button onClick={() => removeImage(idx)} style={{ position: 'absolute', top: -6, right: -6, background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><X size={10} /></button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                        <button onClick={() => setCurrentStep(2)} style={{ width: '30%', padding: '12px', backgroundColor: 'transparent', color: '#4b5563', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer' }}>Go Back</button>
                                        <button onClick={handleNextStep} style={{ flex: 1, padding: '12px', backgroundColor: '#111', color: 'white', border: 'none', borderRadius: '6px', fontSize: '1.1rem', fontWeight: 600, cursor: 'pointer' }}>Review & Pay</button>
                                    </div>
                                </div>
                            )}

                            {currentStep === 4 && (
                                <div>
                                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', fontSize: '1.5rem', color: '#002a4d' }}><CreditCard size={24} color="#1d4ed8" /> Payment</h2>
                                    <div style={{ backgroundColor: '#f9fafb', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
                                        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem' }}>Final Summary</h3>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#4b5563' }}><span>Subtotal ({activeQuantity} items)</span><span>₹{totalAmount}</span></div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#4b5563' }}><span>Shipping Fee</span><span style={{ color: 'green' }}>Free</span></div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb', fontSize: '1.3rem', fontWeight: 'bold' }}><span>Total to Pay</span><span>₹{totalAmount}</span></div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <button disabled={loading} onClick={() => setCurrentStep(activeSteps[activeSteps.length - 2].id)} style={{ width: '30%', padding: '15px', backgroundColor: 'transparent', color: '#4b5563', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer' }}>Go Back</button>
                                        <button disabled={loading} onClick={handlePlaceOrder} style={{ flex: 1, padding: '15px', backgroundColor: '#111', color: 'white', border: 'none', borderRadius: '6px', fontSize: '1.1rem', fontWeight: 600, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}><ShoppingBag size={18} /> {loading ? 'Processing...' : `Pay ₹${totalAmount}`}</button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
