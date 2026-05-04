import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Eye, CheckCircle, XCircle } from 'lucide-react';
import { getOptimizedUrl } from '../../utils/imageUtils';
import { useNotification } from '../../context/NotificationContext';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { showNotification } = useNotification();

    const fetchOrders = async () => {
        try {
            const { data } = await api.get('/orders/admin/orders');
            setOrders(data.orders);
        } catch (error) {
            console.error("Failed to load orders", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const updateStatus = async (id, status) => {
        try {
            await api.put(`/orders/admin/order/${id}`, { status });
            fetchOrders(); 
            showNotification("Order status updated", "success");
        } catch (error) {
            console.error("Update failed", error);
            showNotification("Failed to update status", "error");
        }
    };

    const [expandedOrderId, setExpandedOrderId] = useState(null);

    const toggleExpand = (orderId) => {
        setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
    };

    const handleDownload = async (imgUrl, filename) => {
        try {
            const response = await fetch(imgUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename || 'customization-image.jpg';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download failed', error);
            showNotification('Failed to download image directly. It might open in a new tab instead.', "warning");
            window.open(imgUrl, '_blank');
        }
    };

    if (loading) return <div>Loading orders...</div>;

    return (
        <div>
            <h1 style={{ marginBottom: '2rem' }}>Order Management</h1>

            <div style={{ backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: 'var(--color-surface)', textAlign: 'left' }}>
                            <th style={{ padding: '1rem' }}>Order ID</th>
                            <th style={{ padding: '1rem' }}>User</th>
                            <th style={{ padding: '1rem' }}>Date</th>
                            <th style={{ padding: '1rem' }}>Total</th>
                            <th style={{ padding: '1rem' }}>Status</th>
                            <th style={{ padding: '1rem' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => (
                            <React.Fragment key={order._id}>
                                <tr style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '1rem', fontFamily: 'monospace' }}>{order._id.substring(0, 8)}...</td>
                                    <td style={{ padding: '1rem' }}>
                                        {order.user ? (
                                            <div>
                                                <div style={{ fontWeight: 600 }}>{order.user.name}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'gray' }}>{order.user.email}</div>
                                            </div>
                                        ) : (
                                            <span style={{ color: 'red' }}>Guest / Deleted</span>
                                        )}
                                    </td>
                                    <td style={{ padding: '1rem' }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                                    <td style={{ padding: '1rem' }}>₹{order.totalPrice}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            backgroundColor: order.orderStatus === 'Completed' ? '#e6f4ea' : order.orderStatus === 'Cancelled' ? '#ffebee' : '#fff3e0',
                                            color: order.orderStatus === 'Completed' ? 'green' : order.orderStatus === 'Cancelled' ? 'red' : 'orange',
                                            fontSize: '0.8rem'
                                        }}>
                                            {order.orderStatus}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            onClick={() => toggleExpand(order._id)}
                                            style={{ padding: '5px 10px', cursor: 'pointer', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '4px' }}
                                        >
                                            {expandedOrderId === order._id ? 'Hide' : 'View'} Details
                                        </button>
                                        <select
                                            value={order.orderStatus}
                                            onChange={(e) => updateStatus(order._id, e.target.value)}
                                            style={{ padding: '5px', borderRadius: '4px', borderColor: '#ddd' }}
                                        >
                                            <option value="Pending">Pending</option>
                                            <option value="Approved">Approved</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Completed">Completed (Delivered)</option>
                                            <option value="Cancelled">Cancelled</option>
                                        </select>
                                    </td>
                                </tr>
                                {expandedOrderId === order._id && (
                                    <tr>
                                        <td colSpan="6" style={{ backgroundColor: '#f9f9f9', padding: '1rem' }}>
                                            <h4>Order Items & Customization</h4>
                                            <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
                                                {order.orderItems.map((item, idx) => (
                                                    <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', borderBottom: '1px solid #ddd', paddingBottom: '0.5rem' }}>
                                                        <img src={getOptimizedUrl(item.image, 100)} alt={item.name} loading="lazy" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                                                        <div style={{ flex: 1 }}>
                                                            <p style={{ fontWeight: 600 }}>{item.name}</p>
                                                            <p style={{ fontSize: '0.9rem' }}>Size: {item.size} | Qty: {item.quantity}</p>

                                                            {}
                                                            {item.customization && (item.customization.text || item.customization.image) && (
                                                                <div style={{ marginTop: '0.5rem', padding: '0.5rem', backgroundColor: '#fff', border: '1px dashed #ccc', borderRadius: '4px' }}>
                                                                    <strong>Customization:</strong>
                                                                    {item.customization.text && <p>Text: "<em>{item.customization.text}</em>"</p>}
                                                                    {item.customization.image && (
                                                                        <div style={{ marginTop: '0.5rem' }}>
                                                                            <p style={{ marginBottom: '5px' }}>Uploaded Image(s):</p>
                                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                                                                                {item.customization.image.split(',').filter(imgUrl => imgUrl.trim() !== '').map((imgUrl, imgIdx) => (
                                                                                    <div key={imgIdx} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
                                                                                        <a href={imgUrl} target="_blank" rel="noopener noreferrer">
                                                                                            <img
                                                                                                src={getOptimizedUrl(imgUrl, 200)}
                                                                                                loading="lazy"
                                                                                                alt={`Custom Upload ${imgIdx + 1}`}
                                                                                                style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ddd' }}
                                                                                                onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/100?text=No+Image'; }}
                                                                                            />
                                                                                        </a>
                                                                                        <button
                                                                                            onClick={(e) => {
                                                                                                e.preventDefault();
                                                                                                handleDownload(imgUrl, `order-${order._id}-custom-${imgIdx + 1}.jpg`);
                                                                                            }}
                                                                                            style={{
                                                                                                padding: '5px 10px',
                                                                                                backgroundColor: 'var(--color-primary)',
                                                                                                color: 'white',
                                                                                                border: 'none',
                                                                                                borderRadius: '4px',
                                                                                                cursor: 'pointer',
                                                                                                fontSize: '0.8rem',
                                                                                                textAlign: 'center'
                                                                                            }}
                                                                                        >
                                                                                            Download
                                                                                        </button>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <p style={{ fontWeight: 600 }}>₹{item.price}</p>
                                                    </div>
                                                ))}
                                            </div>

                                            <div style={{ marginTop: '1rem', borderTop: '1px solid #ddd', paddingTop: '1rem' }}>
                                                <strong>Shipping Details:</strong>
                                                <p>{order.shippingAddress.fullName}</p>
                                                <p>{order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
                                                <p>Phone: {order.shippingAddress.phone}</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
                {orders.length === 0 && <p style={{ padding: '2rem', textAlign: 'center' }}>No orders found.</p>}
            </div>
        </div>
    );
};

export default AdminOrders;

