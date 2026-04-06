import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { User, Lock, Package, Star } from 'lucide-react';

const Profile = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('orders'); 

    
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

    // Password State
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

    // Orders State
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(true);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        setName(user.name || '');
        setEmail(user.email || '');
        
        // Admins shouldn't have order history, default them to profile tab
        if (user.role === 'admin') {
            setActiveTab('profile');
        } else {
            fetchMyOrders();
        }
    }, [user, navigate]);

    const fetchMyOrders = async () => {
        try {
            setLoadingOrders(true);
            const { data } = await api.get('/orders/me');
            setOrders(data.orders || []);
        } catch (error) {
            console.error("Failed to fetch orders", error);
        } finally {
            setLoadingOrders(false);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setIsUpdatingProfile(true);
        try {
            await api.put('/auth/updatedetails', { name, email });
            alert("Profile updated successfully! Please log in again to see changes.");
            
            
        } catch (error) {
            alert(error.response?.data?.error || "Failed to update profile");
        } finally {
            setIsUpdatingProfile(false);
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        setIsUpdatingPassword(true);
        try {
            await api.put('/auth/updatepassword', { currentPassword, newPassword });
            alert("Password updated successfully!");
            setCurrentPassword('');
            setNewPassword('');
        } catch (error) {
            alert(error.response?.data?.error || "Failed to update password");
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    if (!user) return null;

    return (
        <div className="container" style={{ minHeight: '60vh', padding: 'clamp(1rem, 4vw, 3rem) 1rem 4rem 1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'clamp(1rem, 3vw, 2rem)' }}>
                <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', fontFamily: 'var(--font-heading)' }}>My Account</h1>
            </div>

            <div className="profile-layout">
                {}
                <div className="profile-sidebar">
                    {user?.role !== 'admin' && (
                        <button
                            onClick={() => setActiveTab('orders')}
                            className={`profile-tab ${activeTab === 'orders' ? 'active' : ''}`}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem',
                                backgroundColor: activeTab === 'orders' ? 'var(--color-surface)' : 'transparent',
                                border: 'none', cursor: 'pointer', fontSize: '0.95rem',
                                fontWeight: activeTab === 'orders' ? 600 : 400,
                                borderTopLeftRadius: '8px', borderTopRightRadius: '8px',
                                minWidth: 'max-content'
                            }}
                        >
                            <Package size={18} /> Order History
                        </button>
                    )}
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`profile-tab ${activeTab === 'profile' ? 'active' : ''}`}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem',
                            backgroundColor: activeTab === 'profile' ? 'var(--color-surface)' : 'transparent',
                            border: 'none', cursor: 'pointer', fontSize: '0.95rem',
                            fontWeight: activeTab === 'profile' ? 600 : 400,
                            borderTopLeftRadius: '8px', borderTopRightRadius: '8px',
                            minWidth: 'max-content'
                        }}
                    >
                        <User size={18} /> Account Details
                    </button>
                </div>

                {}
                <div>
                    {activeTab === 'orders' && user?.role !== 'admin' && (
                        <div>
                            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>My Orders</h2>
                            {loadingOrders ? (
                                <p>Loading orders...</p>
                            ) : orders.length === 0 ? (
                                <div style={{ padding: '3rem', textAlign: 'center', backgroundColor: 'var(--color-surface)', borderRadius: '8px' }}>
                                    <Package size={48} color="var(--color-text-light)" style={{ marginBottom: '1rem' }} />
                                    <h3>No orders found</h3>
                                    <p style={{ color: 'var(--color-text-light)', marginTop: '0.5rem', marginBottom: '1.5rem' }}>You haven't placed any orders yet.</p>
                                    <button onClick={() => navigate('/shop')} className="btn-primary">Start Shopping</button>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    {orders.map(order => (
                                        <div key={order._id} style={{ border: '1px solid var(--color-accent)', borderRadius: '8px', overflow: 'hidden' }}>
                                            <div className="order-header" style={{ backgroundColor: 'var(--color-surface)', padding: '1.2rem', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-accent)' }}>
                                                <div>
                                                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', textTransform: 'uppercase' }}>Order Placed</p>
                                                    <p style={{ fontWeight: 500 }}>{new Date(order.createdAt).toLocaleDateString()}</p>
                                                </div>
                                                <div>
                                                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', textTransform: 'uppercase' }}>Total</p>
                                                    <p style={{ fontWeight: 500 }}>₹{order.totalPrice}</p>
                                                </div>
                                                <div>
                                                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', textTransform: 'uppercase' }}>Status</p>
                                                    <span style={{
                                                        display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 500,
                                                        backgroundColor: order.orderStatus === 'Completed' ? '#e6f4ea' : (order.orderStatus === 'Processing' ? '#fef7e0' : 'var(--color-accent)'),
                                                        color: order.orderStatus === 'Completed' ? '#137333' : (order.orderStatus === 'Processing' ? '#b06000' : 'var(--color-text)')
                                                    }}>
                                                        {order.orderStatus}
                                                    </span>
                                                </div>
                                            </div>

                                            <div style={{ padding: 'clamp(1rem, 3vw, 1.5rem)' }}>
                                                {order.orderItems.map((item, index) => (
                                                    <div key={index} className="order-item-layout" style={{ display: 'flex', gap: '1.5rem', marginBottom: index !== order.orderItems.length - 1 ? '1.5rem' : '0', paddingBottom: index !== order.orderItems.length - 1 ? '1.5rem' : '0', borderBottom: index !== order.orderItems.length - 1 ? '1px solid var(--color-accent)' : 'none' }}>
                                                        <div style={{ width: 'clamp(80px, 20vw, 100px)', height: 'clamp(80px, 20vw, 100px)', backgroundColor: 'var(--color-surface)', flexShrink: 0 }}>
                                                            {item.image && <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} referrerPolicy="no-referrer" />}
                                                        </div>
                                                        <div style={{ flex: 1 }}>
                                                            <Link to={`/product/${item.product?._id || item.product}`} style={{ fontWeight: 600, fontSize: 'clamp(1rem, 2.5vw, 1.1rem)', color: 'var(--color-text)', textDecoration: 'none', display: 'block', marginBottom: '0.25rem' }}>{item.name}</Link>
                                                            <p style={{ color: 'var(--color-text-light)', fontSize: '0.9rem' }}>Size: {item.size}  |  Qty: {item.quantity}</p>
                                                            {item.customization && item.customization.text && (
                                                                <p style={{ color: 'var(--color-text-light)', fontSize: '0.9rem', marginTop: '0.25rem', backgroundColor: '#fcfaf8', padding: '0.5rem', borderRadius: '4px', display: 'inline-block' }}>Text: "{item.customization.text}"</p>
                                                            )}
                                                        </div>
                                                        <div className="order-item-actions" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'flex-start', gap: '0.5rem' }}>
                                                            <p style={{ fontWeight: 600, fontSize: 'clamp(1rem, 2.5vw, 1.1rem)' }}>₹{item.price}</p>
                                                            <Link to={`/product/${item.product?._id || item.product}`} state={{ openReviewModal: true }} className="btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: 'auto' }}>
                                                                <Star size={14} /> Review
                                                            </Link>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'profile' && (
                        <div style={{ maxWidth: '600px' }}>
                            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Account Details</h2>

                            <div style={{ backgroundColor: 'var(--color-surface)', padding: '2rem', borderRadius: '8px', marginBottom: '2rem' }}>
                                <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><User size={20} /> Personal Information</h3>
                                <form onSubmit={handleUpdateProfile}>
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Full Name</label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            style={{ width: '100%', padding: '12px', border: '1px solid var(--color-accent)' }}
                                            required
                                        />
                                    </div>
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Email Address</label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            style={{ width: '100%', padding: '12px', border: '1px solid var(--color-accent)' }}
                                            required
                                        />
                                    </div>
                                    <button type="submit" className="btn-primary" disabled={isUpdatingProfile}>
                                        {isUpdatingProfile ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </form>
                            </div>

                            <div style={{ backgroundColor: 'var(--color-surface)', padding: '2rem', borderRadius: '8px' }}>
                                <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Lock size={20} /> Change Password</h3>
                                <form onSubmit={handleUpdatePassword}>
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Current Password</label>
                                        <input
                                            type="password"
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            style={{ width: '100%', padding: '12px', border: '1px solid var(--color-accent)' }}
                                            required
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>New Password</label>
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            style={{ width: '100%', padding: '12px', border: '1px solid var(--color-accent)' }}
                                            required
                                            placeholder="••••••••"
                                            minLength="6"
                                        />
                                    </div>
                                    <button type="submit" className="btn-outline" disabled={isUpdatingPassword}>
                                        {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                                    </button>
                                </form>
                            </div>

                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .profile-layout {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 1.5rem;
                }
                
                .profile-sidebar {
                    display: flex;
                    flex-direction: row;
                    overflow-x: auto;
                    gap: 0.5rem;
                    border-bottom: 2px solid var(--color-accent);
                    -ms-overflow-style: none; /* IE and Edge */
                    scrollbar-width: none;  /* Firefox */
                }
                .profile-sidebar::-webkit-scrollbar {
                    display: none;
                }
                
                .profile-tab {
                    flex: 1;
                    justify-content: center;
                    border-left: none !important;
                    border-bottom: 3px solid transparent;
                    transition: all 0.2s ease;
                }
                .profile-tab.active {
                    border-bottom: 3px solid var(--color-primary) !important;
                }

                .order-header {
                    flex-direction: column;
                    gap: 0.8rem;
                }
                
                .order-header > div {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .order-item-layout {
                    flex-direction: row;
                    /* Wrap text if screens get incredibly small, but usually row is fine inside orders
                       if we use flex-wrap or just scale images down */
                }
                
                .order-item-actions {
                    align-items: flex-end; /* right align on mobile by default but lets keep it standard */
                }

                @media (max-width: 480px) {
                    .order-item-layout {
                        flex-direction: column;
                    }
                    .order-item-actions {
                        align-items: flex-start !important;
                        flex-direction: row-reverse !important;
                        justify-content: space-between !important;
                        width: 100%;
                        margin-top: 0.5rem;
                    }
                }

                @media (min-width: 768px) {
                    .profile-layout {
                        grid-template-columns: 250px 1fr;
                        gap: 3rem;
                    }
                    .profile-sidebar {
                        flex-direction: column;
                        overflow-x: visible;
                        border-bottom: none;
                        gap: 0.5rem;
                        align-self: start; /* Prevents vertical stretching in CSS Grid */
                    }
                    .profile-tab {
                        justify-content: flex-start;
                        border-bottom: none !important;
                        border-left: 3px solid transparent;
                        border-top-left-radius: 0 !important;
                        border-top-right-radius: 0 !important;
                        background-color: transparent !important;
                        flex: none; /* Crucial to undo the vertical height stretch */
                    }
                    .profile-tab.active {
                        border-left: 3px solid var(--color-primary) !important;
                        background-color: var(--color-surface) !important;
                    }
                    .order-header {
                        flex-direction: row;
                        justify-content: space-between;
                        gap: 0;
                    }
                    .order-header > div {
                        display: block;
                        text-align: left;
                    }
                }
            `}</style>
        </div>
    );
};

export default Profile;
