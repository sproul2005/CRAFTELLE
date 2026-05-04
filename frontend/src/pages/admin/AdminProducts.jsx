import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Edit, Trash2, Plus } from 'lucide-react';
import { getOptimizedUrl } from '../../utils/imageUtils';
import { useNotification } from '../../context/NotificationContext';

const AdminProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { showNotification } = useNotification();

    const fetchProducts = async () => {
        try {
            const { data } = await api.get('/products?limit=1000');
            setProducts(data.products || data.data || []);
        } catch (error) {
            console.error("Failed to load products", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this product?")) return;
        try {
            await api.delete(`/products/${id}`);
            setProducts(products.filter(p => p._id !== id));
            showNotification("Product deleted successfully", "success");
        } catch (error) {
            showNotification("Failed to delete product", "error");
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>Products</h1>
                <Link to="/admin/product/new">
                    <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Plus size={18} /> Add Product
                    </button>
                </Link>
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: 'var(--color-surface)', textAlign: 'left' }}>
                            <th style={{ padding: '1rem' }}>Image</th>
                            <th style={{ padding: '1rem' }}>Name</th>
                            <th style={{ padding: '1rem' }}>Price</th>
                            <th style={{ padding: '1rem' }}>Category</th>
                            <th style={{ padding: '1rem' }}>Stock</th>
                            <th style={{ padding: '1rem' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(product => (
                            <tr key={product._id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '1rem' }}>
                                    <img
                                        src={product.images && product.images[0] ? getOptimizedUrl(product.images[0].url, 100) : '/placeholder.jpg'}
                                        loading="lazy"
                                        onError={(e) => { e.target.style.display = 'none' }}
                                        alt={product.name}
                                        style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px', backgroundColor: '#eee' }}
                                    />
                                </td>
                                <td style={{ padding: '1rem', fontWeight: 500 }}>{product.name}</td>
                                <td style={{ padding: '1rem' }}>₹{product.price}</td>
                                <td style={{ padding: '1rem' }}>{product.category}</td>
                                <td style={{ padding: '1rem' }}>
                                    {}
                                    {product.sizes && product.sizes.length > 0
                                        ? product.sizes.reduce((acc, s) => acc + s.stock, 0)
                                        : 'N/A'}
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <Link to={`/admin/product/${product._id}`}>
                                            <Edit size={18} color="var(--color-secondary)" style={{ cursor: 'pointer' }} />
                                        </Link>
                                        <Trash2 size={18} color="red" style={{ cursor: 'pointer' }} onClick={() => handleDelete(product._id)} />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {products.length === 0 && <p style={{ padding: '2rem', textAlign: 'center' }}>No products found.</p>}
            </div>
        </div>
    );
};

export default AdminProducts;
