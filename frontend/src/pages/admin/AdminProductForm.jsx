import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import { ChevronLeft, Plus, Trash2 } from 'lucide-react';

const AdminProductForm = () => {
    const categories = ['Anniversary', 'Marriage', 'Birthday', 'Baby Details', 'Gifts', 'Nameplate', 'Clock', 'Bangles', 'Resin Art', 'String Art', 'Candles', 'Rakhi'];
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        description: '',
        category: 'Resin Art',
        customizationType: 'none',
        isTrending: false,
        images: [],
    });
    const [sizes, setSizes] = useState([{ label: '8"Inch', price: 0, stock: 0 }]);
    const [files, setFiles] = useState([]);
    const [existingImages, setExistingImages] = useState([]);

    useEffect(() => {
        if (isEditMode) {
            const fetchProduct = async () => {
                setLoading(true);
                try {
                    const { data } = await api.get(`/products/${id}`);
                    const p = data.product;
                    setFormData({
                        name: p.name,
                        price: p.price,
                        description: p.description,
                        category: p.category,
                        customizationType: p.customizationType,
                        isTrending: p.isTrending || false,
                    });
                    setExistingImages(p.images || []);
                    if (p.sizes && p.sizes.length > 0) setSizes(p.sizes);
                } catch (error) {
                    console.error("Failed to fetch", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchProduct();
        }
    }, [id, isEditMode]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSizeChange = (index, field, value) => {
        const newSizes = [...sizes];
        newSizes[index][field] = field === 'label' ? value : Number(value);
        setSizes(newSizes);
    };

    const addSize = () => {
        setSizes([...sizes, { label: '', price: 0, stock: 0 }]);
    };

    const removeSize = (index) => {
        setSizes(sizes.filter((_, i) => i !== index));
    };

    const handleFileChange = (e) => {
        setFiles(Array.from(e.target.files));
    };

    const handleRemoveExistingImage = (public_id) => {
        setExistingImages(existingImages.filter(img => img.public_id !== public_id));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        data.append('name', formData.name);
        data.append('price', formData.price);
        data.append('description', formData.description);
        data.append('category', formData.category);
        data.append('customizationType', formData.customizationType);
        data.append('isTrending', formData.isTrending);
        data.append('sizes', JSON.stringify(sizes));

        // Append existing images that the user wants to KEEP
        data.append('existingImages', JSON.stringify(existingImages));


        files.forEach(file => {
            data.append('images', file);
        });

        try {
            if (isEditMode) {
                await api.put(`/products/${id}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await api.post('/products', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            navigate('/admin/products');
        } catch (error) {
            console.error(error);
            const msg = error.response && error.response.data && error.response.data.error
                ? error.response.data.error
                : "Operation failed";
            alert(`Error: ${msg}`);
        } finally {
            setLoading(false);
        }
    };

    if (loading && isEditMode && !formData.name) return <div>Loading...</div>;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <button onClick={() => navigate('/admin/products')} style={{ marginBottom: '1rem', border: 'none', background: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-light)' }}>
                <ChevronLeft size={16} /> Back to Products
            </button>

            <h1 style={{ marginBottom: '2rem' }}>{isEditMode ? 'Edit Product' : 'Add New Product'}</h1>

            <form onSubmit={handleSubmit} style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Product Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required style={{ width: '100%', padding: '10px', border: '1px solid #ddd' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Base Price (₹)</label>
                        <input type="number" name="price" value={formData.price} onChange={handleChange} required style={{ width: '100%', padding: '10px', border: '1px solid #ddd' }} />
                    </div>
                </div>

                <div style={{ marginTop: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Description</label>
                    <textarea name="description" value={formData.description} onChange={handleChange} rows="4" style={{ width: '100%', padding: '10px', border: '1px solid #ddd' }}></textarea>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Category</label>
                        <select
                            value={formData.category}
                            name="category"
                            onChange={handleChange}
                            style={{ width: '100%', padding: '10px', border: '1px solid #ddd' }}
                        >
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Customization Type</label>
                        <select name="customizationType" value={formData.customizationType} onChange={handleChange} style={{ width: '100%', padding: '10px', border: '1px solid #ddd' }}>
                            <option value="none">None</option>
                            <option value="text">Text Only</option>
                            <option value="photo">Photo Only</option>
                            <option value="both">Both (Text & Photo)</option>
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 500 }}>
                            <input
                                type="checkbox"
                                name="isTrending"
                                checked={formData.isTrending || false}
                                onChange={(e) => setFormData({ ...formData, isTrending: e.target.checked })}
                                style={{ width: '18px', height: '18px' }}
                            />
                            Trending Product (Show on Home)
                        </label>
                    </div>
                </div>

                { }
                <div style={{ marginTop: '2rem', padding: '1rem', border: '1px solid #eee' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <label style={{ fontWeight: 600 }}>Sizes & Stock</label>
                        <button type="button" onClick={addSize} style={{ border: 'none', background: 'var(--color-secondary)', color: 'white', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer' }}><Plus size={14} /></button>
                    </div>

                    {sizes.map((size, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <input type="text" placeholder='Label (e.g. 8"Inch)' value={size.label} onChange={(e) => handleSizeChange(idx, 'label', e.target.value)} style={{ flex: 2, padding: '8px' }} />
                            <input type="number" placeholder="Price Override" value={size.price} onChange={(e) => handleSizeChange(idx, 'price', e.target.value)} style={{ flex: 1, padding: '8px' }} />
                            <input type="number" placeholder="Stock" value={size.stock} onChange={(e) => handleSizeChange(idx, 'stock', e.target.value)} style={{ flex: 1, padding: '8px' }} />
                            <button type="button" onClick={() => removeSize(idx)} style={{ border: 'none', background: 'none', color: 'red' }}><Trash2 size={16} /></button>
                        </div>
                    ))}
                </div>

                { }
                <div style={{ marginTop: '2rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Product Images</label>
                    <input type="file" multiple onChange={handleFileChange} accept="image/*" />

                    {/* Show existing images */}
                    {isEditMode && existingImages.length > 0 && (
                        <div style={{ marginTop: '1rem' }}>
                            <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>Current Images:</p>
                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                {existingImages.map(img => (
                                    <div key={img.public_id} style={{ position: 'relative' }}>
                                        <img src={img.url} alt="" referrerPolicy="no-referrer" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ddd' }} />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveExistingImage(img.public_id)}
                                            style={{
                                                position: 'absolute', top: '-5px', right: '-5px',
                                                background: 'red', color: 'white', border: 'none',
                                                borderRadius: '50%', width: '20px', height: '20px',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                cursor: 'pointer', fontSize: '12px'
                                            }}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <button type="submit" className="btn-primary" style={{ marginTop: '2rem', width: '100%' }} disabled={loading}>
                    {loading ? 'Saving...' : (isEditMode ? 'Update Product' : 'Create Product')}
                </button>
            </form>
        </div>
    );
};

export default AdminProductForm;
