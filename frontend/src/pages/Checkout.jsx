import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { ShoppingBag, Truck, Camera, CreditCard, ChevronLeft, Upload, X, ShieldCheck, RefreshCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Checkout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();

    
    const { product, selectedSize, quantity } = location.state || {};

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

    // Customization states
    const [customText, setCustomText] = useState('');
    const [customImages, setCustomImages] = useState([]); // Up to 5 images

    useEffect(() => {
        window.scrollTo(0, 0);
        // If they navigate here directly without a product, kick them back
        if (!product) {
            navigate('/shop');
        }
    }, [product, navigate]);

    if (!product) return null;

    const sizeObj = product.sizes?.find(s => s.label === selectedSize);
    const price = (sizeObj && sizeObj.price > 0) ? sizeObj.price : product.price;
    const totalAmount = price * quantity;

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
        
        if (currentStep === 2 && product.customizationType === 'none') {
            setCurrentStep(4);
            return;
        }
        
        if (currentStep === 3 && product.customizationType !== 'none') {
            if ((product.customizationType === 'text' || product.customizationType === 'both') && !customText.trim()) {
                alert("Please provide the custom text/name required for this product.");
                return;
            }
            if ((product.customizationType === 'photo' || product.customizationType === 'both') && customImages.length === 0) {
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
                    const formData = new FormData();
                    formData.append('image', img);
                    const res = await api.post('/upload', formData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });
                    uploadedImageUrls.push(res.data.url);
                }
            }

            
            
            
            const joinedImageUrls = uploadedImageUrls.join(',');

            const orderItems = [{
                product: product._id,
                name: product.name,
                image: product.images[0]?.url || '',
                price: price,
                quantity: quantity,
                size: selectedSize || '',
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

            const { data: orderResponse } = await api.post('/orders/new', orderData);
            const createdOrderId = orderResponse.order._id;

            
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
                console.error('Razorpay creation failed, falling back:', err);
                const errorMsg = err.response?.data?.error || err.message || 'Unknown error';
                alert(`Payment gateway error: ${errorMsg}. Your order #${createdOrderId.substring(0, 6)} has been saved. Please contact support to complete payment.`);
                navigate('/my-orders');
                return;
            }

            
            const options = {
                key: keyResponse.key,
                amount: rpOrderResponse.order.amount,
                currency: "INR",
                name: "Craftelle",
                description: `Purchase of ${product.name}`,
                image: "https://res.cloudinary.com/craftelle/image/upload/v1/logo", 
                order_id: rpOrderResponse.order.id,
                handler: async function (response) {
                    try {
                        const verifyData = {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            orderId: createdOrderId
                        };
                        const { data: verifyResponse } = await api.post('/payment/verify', verifyData);
                        if (verifyResponse.success) {
                            alert('Payment successful! Your order has been placed.');
                            navigate('/my-orders');
                        }
                    } catch (err) {
                        console.error('Payment Verification Error:', err);
                        alert("Payment verification failed! If money was deducted, please contact support.");
                        navigate('/my-orders');
                    }
                },
                prefill: {
                    name: shippingAddress.fullName,
                    email: user?.email || '',
                    contact: shippingAddress.phone
                },
                theme: {
                    color: "#111111"
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response) {
                alert(`Payment Failed: ${response.error.description}. You can retry from your orders page.`);
                navigate('/my-orders');
            });
            rzp.open();

        } catch (error) {
            console.error('Checkout error:', error);
            const errorMsg = error.response?.data?.error || error.message || 'Unknown error';
            alert(`Checkout failed: ${errorMsg}. Please try again.`);
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

    
    const activeSteps = product.customizationType === 'none'
        ? steps.filter(s => s.id !== 3)
        : steps;

    return (
        <div style={{ backgroundColor: '#f4f7fc', minHeight: '100vh', paddingBottom: '3rem' }}>
            <div className="container" style={{ paddingTop: '2rem' }}>
                <style>{`
                    .premium-summary-card {
                        background-color: #fff;
                        border: 1px solid #e5e7eb;
                        border-radius: 16px;
                        padding: 2rem;
                        margin-bottom: 2rem;
                        box-shadow: 0 10px 30px rgba(0,0,0,0.03);
                        display: flex;
                        flex-direction: column;
                        gap: 2rem;
                    }
                    .summary-product-details {
                        display: flex;
                        gap: 1.5rem;
                        align-items: stretch;
                    }
                    .summary-img-container {
                        width: 160px;
                        flex-shrink: 0;
                    }
                    .summary-img {
                        width: 100%;
                        aspect-ratio: 1/1;
                        object-fit: cover;
                        border-radius: 12px;
                        box-shadow: 0 4px 15px rgba(0,0,0,0.08);
                    }
                    .summary-text-container {
                        flex: 1;
                        display: flex;
                        flex-direction: column;
                        gap: 0.5rem;
                    }
                    .summary-title {
                        font-size: 1.5rem;
                        color: #111;
                        font-family: var(--font-heading);
                        margin: 0;
                        line-height: 1.2;
                    }
                    .summary-price {
                        font-size: 1.8rem;
                        font-weight: 800;
                        color: #111;
                        letter-spacing: -0.5px;
                        margin-top: auto;
                    }
                    .summary-badges {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
                        gap: 1rem;
                        padding-top: 1.5rem;
                        border-top: 1px solid #f3f4f6;
                    }
                    @media (max-width: 640px) {
                        .premium-summary-card {
                            padding: 1.2rem;
                            gap: 1.5rem;
                        }
                        .summary-product-details {
                            gap: 1rem;
                        }
                        .summary-img-container {
                            width: 100px;
                        }
                        .summary-img {
                            border-radius: 8px;
                        }
                        .summary-title {
                            font-size: 1.2rem;
                        }
                        .summary-price {
                            font-size: 1.4rem;
                            padding-top: 0.5rem;
                        }
                        .summary-badges {
                            grid-template-columns: 1fr;
                            gap: 0.8rem;
                        }
                    }
                `}</style>
                <button onClick={() => navigate(-1)} style={{ marginBottom: '1.5rem', border: 'none', background: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#555', cursor: 'pointer', fontWeight: 500 }}>
                    <ChevronLeft size={16} /> Back to Product
                </button>

                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontFamily: 'var(--font-heading)', color: '#001a4d', fontSize: 'clamp(2rem, 5vw, 2.5rem)', marginBottom: '0.5rem' }}>Complete Your Order</h1>
                    <p style={{ color: '#555', fontSize: '1.1rem' }}>Fill in your details and customize your order</p>
                </div>

                {}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', width: '100%', paddingBottom: '0.5rem' }}>
                    {activeSteps.map((step, index) => (
                        <React.Fragment key={step.id}>
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '0.3rem',
                                opacity: currentStep >= step.id ? 1 : 0.5,
                                flex: 1,
                                minWidth: '0' 
                            }}>
                                <div style={{
                                    width: '32px', height: '32px',
                                    borderRadius: '50%',
                                    backgroundColor: currentStep >= step.id ? '#1d4ed8' : 'transparent',
                                    border: currentStep >= step.id ? 'none' : '2px solid #ccc',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: currentStep >= step.id ? 'white' : '#888'
                                }}>
                                    {}
                                    {React.cloneElement(step.icon, { size: 14 })}
                                </div>
                                <span style={{ fontSize: 'clamp(0.65rem, 2vw, 0.85rem)', fontWeight: 500, color: currentStep >= step.id ? '#1d4ed8' : '#888', textAlign: 'center', lineHeight: '1.2' }}>
                                    {step.label}
                                </span>
                            </div>
                            {index < activeSteps.length - 1 && (
                                <div style={{ flex: 1, height: '2px', backgroundColor: currentStep > activeSteps[index].id ? '#1d4ed8' : '#e5e7eb', margin: '0 0.2rem', marginBottom: '1.5rem', minWidth: '15px' }} />
                            )}
                        </React.Fragment>
                    ))}
                </div>

                {}
                <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden' }}>

                    <AnimatePresence mode='wait'>
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            style={{ padding: 'clamp(1.5rem, 4vw, 3rem)' }}
                        >
                            {}
                            {currentStep === 1 && (
                                <div>
                                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', fontSize: '1.5rem', color: '#002a4d' }}>
                                        <ShoppingBag size={24} color="#1d4ed8" /> Order Summary
                                    </h2>

                                    {}
                                    <div className="premium-summary-card">
                                        {}
                                        <div className="summary-product-details">
                                            <div className="summary-img-container">
                                                <img
                                                    src={product.images[0]?.url}
                                                    alt={product.name}
                                                    className="summary-img"
                                                />
                                            </div>

                                            <div className="summary-text-container">
                                                <h3 className="summary-title">{product.name}</h3>
                                                <p style={{ color: '#6b7280', fontSize: '1rem', margin: 0 }}>{product.category}</p>

                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '0.5rem', alignItems: 'center' }}>
                                                    {selectedSize && (
                                                        <span style={{ backgroundColor: '#f3f4f6', color: '#374151', padding: '0.4rem 1rem', borderRadius: '30px', fontSize: '0.85rem', fontWeight: 500 }}>
                                                            Variant: {selectedSize}
                                                        </span>
                                                    )}
                                                    {product.customizationType === 'none' && (
                                                        <span style={{ color: '#4b5563', fontSize: '0.9rem', fontWeight: 500 }}>Qty: {quantity}</span>
                                                    )}
                                                </div>

                                                <div className="summary-price">₹{totalAmount}</div>
                                            </div>
                                        </div>

                                        {}
                                        <div className="summary-badges">
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: '#4b5563', fontSize: '0.9rem', fontWeight: 500 }}>
                                                <div style={{ backgroundColor: '#eff6ff', padding: '0.5rem', borderRadius: '50%' }}>
                                                    <Truck size={18} color="#1d4ed8" />
                                                </div>
                                                Free Delivery
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: '#4b5563', fontSize: '0.9rem', fontWeight: 500 }}>
                                                <div style={{ backgroundColor: '#eff6ff', padding: '0.5rem', borderRadius: '50%' }}>
                                                    <ShieldCheck size={18} color="#1d4ed8" />
                                                </div>
                                                Secure Payment
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: '#4b5563', fontSize: '0.9rem', fontWeight: 500 }}>
                                                <div style={{ backgroundColor: '#eff6ff', padding: '0.5rem', borderRadius: '50%' }}>
                                                    <Camera size={18} color="#1d4ed8" />
                                                </div>
                                                Custom Crafted
                                            </div>
                                        </div>
                                    </div>

                                    <button onClick={handleNextStep} style={{ width: '100%', padding: '15px', backgroundColor: '#111', color: 'white', border: 'none', borderRadius: '6px', fontSize: '1.1rem', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}>
                                        Continue to Delivery Address
                                    </button>
                                </div>
                            )}

                            {}
                            {currentStep === 2 && (
                                <div>
                                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', fontSize: '1.5rem', color: '#002a4d' }}>
                                        <Truck size={24} color="#1d4ed8" /> Delivery Address
                                    </h2>

                                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#374151' }}>Full Name</label>
                                            <input type="text" name="fullName" value={shippingAddress.fullName} onChange={handleAddressChange} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '6px' }} placeholder="Enter receiver's name" />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#374151' }}>Phone Number</label>
                                            <input type="text" name="phone" value={shippingAddress.phone} onChange={handleAddressChange} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '6px' }} placeholder="10-digit mobile number" />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#374151' }}>Full Address</label>
                                            <textarea name="address" value={shippingAddress.address} onChange={handleAddressChange} rows="3" style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '6px' }} placeholder="House NO, Street, Landmark"></textarea>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                            <div>
                                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#374151' }}>City</label>
                                                <input type="text" name="city" value={shippingAddress.city} onChange={handleAddressChange} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '6px' }} />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#374151' }}>Pincode</label>
                                                <input type="text" name="pincode" value={shippingAddress.pincode} onChange={handleAddressChange} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '6px' }} />
                                            </div>
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#374151' }}>State</label>
                                            <input type="text" name="state" value={shippingAddress.state} onChange={handleAddressChange} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '6px' }} />
                                        </div>
                                    </div>

                                    <button onClick={handleNextStep} style={{ width: '100%', padding: '15px', backgroundColor: '#111', color: 'white', border: 'none', borderRadius: '6px', fontSize: '1.1rem', fontWeight: 600, cursor: 'pointer', marginTop: '2rem' }}>
                                        {product.customizationType === 'none' ? 'Proceed to Payment' : 'Proceed to Customization'}
                                    </button>
                                </div>
                            )}

                            {}
                            {currentStep === 3 && product.customizationType !== 'none' && (
                                <div>
                                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '1.5rem', color: '#002a4d' }}>
                                        <Camera size={24} color="#1d4ed8" /> Custom Details
                                    </h2>
                                    <p style={{ color: '#6b7280', marginBottom: '2rem' }}>Make it yours. Provide exactly how you want it crafted.</p>

                                    {(product.customizationType === 'text' || product.customizationType === 'both') && (
                                        <div style={{ marginBottom: '2rem' }}>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#374151' }}>Custom Text / Names</label>
                                            <textarea
                                                value={customText}
                                                onChange={(e) => setCustomText(e.target.value)}
                                                rows="3"
                                                placeholder="Write the exact text exactly as you want it shown on the product..."
                                                style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                                            />
                                        </div>
                                    )}

                                    {(product.customizationType === 'photo' || product.customizationType === 'both') && (
                                        <div style={{ marginBottom: '2rem' }}>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#374151' }}>
                                                Upload Photos <span style={{ color: '#888', fontWeight: 'normal' }}>(Max 5 images)</span>
                                            </label>

                                            <div style={{ border: '2px dashed #d1d5db', backgroundColor: '#f9fafb', borderRadius: '8px', padding: '2rem', textAlign: 'center' }}>
                                                <input
                                                    type="file"
                                                    multiple
                                                    accept="image/*"
                                                    onChange={handleImageUpload}
                                                    style={{ display: 'none' }}
                                                    id="checkout-image-upload"
                                                    disabled={customImages.length >= 5}
                                                />
                                                <label htmlFor="checkout-image-upload" style={{ cursor: customImages.length >= 5 ? 'not-allowed' : 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', opacity: customImages.length >= 5 ? 0.5 : 1 }}>
                                                    <Upload size={32} color="#1d4ed8" />
                                                    <span style={{ fontWeight: 500, color: '#374151' }}>Click to Browse Files</span>
                                                    <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>Required high-quality format</span>
                                                </label>
                                            </div>

                                            {}
                                            {customImages.length > 0 && (
                                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                                                    {customImages.map((img, idx) => (
                                                        <div key={idx} style={{ position: 'relative', width: '80px', height: '80px' }}>
                                                            <img
                                                                src={URL.createObjectURL(img)}
                                                                alt={`preview-${idx}`}
                                                                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px', border: '1px solid #ddd' }}
                                                            />
                                                            <button
                                                                onClick={() => removeImage(idx)}
                                                                style={{ position: 'absolute', top: -8, right: -8, background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
                                                            >
                                                                <X size={12} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: customImages.length === 5 ? 'var(--color-primary)' : '#6b7280' }}>
                                                {customImages.length} / 5 Images Uploaded
                                            </p>
                                        </div>
                                    )}

                                    <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                        <button onClick={() => setCurrentStep(2)} style={{ width: '30%', padding: '15px', backgroundColor: 'transparent', color: '#4b5563', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer' }}>
                                            Go Back
                                        </button>
                                        <button onClick={handleNextStep} style={{ flex: 1, padding: '15px', backgroundColor: '#111', color: 'white', border: 'none', borderRadius: '6px', fontSize: '1.1rem', fontWeight: 600, cursor: 'pointer' }}>
                                            Review & Pay
                                        </button>
                                    </div>
                                </div>
                            )}

                            {}
                            {currentStep === 4 && (
                                <div>
                                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', fontSize: '1.5rem', color: '#002a4d' }}>
                                        <CreditCard size={24} color="#1d4ed8" /> Payment
                                    </h2>

                                    <div style={{ backgroundColor: '#f9fafb', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
                                        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem' }}>Final Summary</h3>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#4b5563' }}>
                                            <span>Subtotal ({quantity} items)</span>
                                            <span>₹{totalAmount}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#4b5563' }}>
                                            <span>Shipping Fee</span>
                                            <span style={{ color: 'green' }}>Free</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb', fontSize: '1.3rem', fontWeight: 'bold' }}>
                                            <span>Total to Pay</span>
                                            <span>₹{totalAmount}</span>
                                        </div>
                                    </div>

                                    <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <ShieldCheck size={32} color="#1d4ed8" />
                                        <p style={{ fontSize: '0.9rem', color: '#1e3a8a' }}>Payments are fully secure and heavily encrypted. We support all major UPI, Credit Cards, and Wallets.</p>
                                    </div>

                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <button disabled={loading} onClick={() => setCurrentStep(activeSteps[activeSteps.length - 2].id)} style={{ width: '30%', padding: '15px', backgroundColor: 'transparent', color: '#4b5563', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer' }}>
                                            Go Back
                                        </button>
                                        <button
                                            disabled={loading}
                                            onClick={handlePlaceOrder}
                                            style={{ flex: 1, padding: '15px', backgroundColor: '#111', color: 'white', border: 'none', borderRadius: '6px', fontSize: '1.1rem', fontWeight: 600, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', opacity: loading ? 0.7 : 1 }}
                                        >
                                            <ShoppingBag size={18} /> {loading ? 'Processing Order...' : `Pay ₹${totalAmount}`}
                                        </button>
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
