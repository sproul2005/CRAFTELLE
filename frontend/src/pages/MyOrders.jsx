import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Package, ChevronRight, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getOptimizedUrl } from '../utils/imageUtils';

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const { data } = await api.get('/orders/me');
                setOrders(data.orders);
            } catch (error) {
                console.error("Failed to load orders", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    if (loading) return <div className="container section">Loading your orders...</div>;

    const getStatusColor = (status) => {
        switch (status) {
            case 'Completed': return 'green';
            case 'Cancelled': return 'red';
            case 'Processing': return 'orange';
            default: return 'var(--color-primary)';
        }
    };

    return (
        <div className="container section">
            <h1 style={{ marginBottom: '2rem' }}>My Orders</h1>

            {orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'var(--color-surface)', borderRadius: '8px' }}>
                    <Package size={48} color="var(--color-text-light)" style={{ marginBottom: '1rem' }} />
                    <h3>No orders yet</h3>
                    <p style={{ color: 'var(--color-text-light)', marginBottom: '1.5rem' }}>Looks like you haven't placed an order yet.</p>
                    <Link to="/" className="btn-primary">Start Shopping</Link>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                    {orders.map(order => (
                        <div key={order._id} style={{ border: '1px solid #eee', borderRadius: '8px', overflow: 'hidden', backgroundColor: 'white' }}>
                            {}
                            <div style={{ backgroundColor: 'var(--color-surface)', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                                <div>
                                    <span style={{ fontWeight: 600, marginRight: '1rem' }}>Order #{order._id.substring(0, 8)}</span>
                                    <span style={{ fontSize: '0.9rem', color: 'var(--color-text-light)' }}>
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        backgroundColor: order.orderStatus === 'Completed' ? '#e6f4ea' : order.orderStatus === 'Cancelled' ? '#ffebee' : '#fff3e0',
                                        color: getStatusColor(order.orderStatus),
                                        fontSize: '0.8rem',
                                        fontWeight: 500
                                    }}>
                                        {order.orderStatus}
                                    </span>
                                    <span style={{ fontWeight: 600 }}>₹{order.totalPrice}</span>
                                </div>
                            </div>

                            {}
                            <div style={{ padding: '1rem' }}>
                                {order.orderItems.map((item, idx) => (
                                    <div key={idx} style={{ display: 'flex', gap: '1rem', marginBottom: idx !== order.orderItems.length - 1 ? '1rem' : 0 }}>
                                        <img src={getOptimizedUrl(item.image, 100)} alt={item.name} loading="lazy" referrerPolicy="no-referrer" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ fontSize: '1rem', marginBottom: '0.2rem' }}>{item.name}</h4>
                                            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-light)' }}>Size: {item.size} | Qty: {item.quantity}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyOrders;
