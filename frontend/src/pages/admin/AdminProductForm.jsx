import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import { ChevronLeft, Plus, Trash2, Upload, X } from 'lucide-react';

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
    const [imageSlots, setImageSlots] = useState([null, null, null, null, null]);
    const [activeSlot, setActiveSlot] = useState(null);
    const fileInputRef = useRef(null);

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
                    const initialSlots = [null, null, null, null, null];
                    if (p.images && p.images.length > 0) {
                        p.images.forEach((img, idx) => {
                            if (idx < 5) initialSlots[idx] = { type: 'existing', data: img };
                        });
                    }
                    setImageSlots(initialSlots);
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

    const handleSlotClick = (index) => {
        setActiveSlot(index);
        fileInputRef.current.click();
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file && activeSlot !== null) {
            const newSlots = [...imageSlots];
            newSlots[activeSlot] = {
                type: 'new',
                file: file,
                previewUrl: URL.createObjectURL(file)
            };
            setImageSlots(newSlots);
        }
        e.target.value = null; // reset input
    };

    const handleRemoveSlot = (e, index) => {
        e.stopPropagation();
        const newSlots = [...imageSlots];
        newSlots[index] = null;
        setImageSlots(newSlots);
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

        const finalExisting = imageSlots
            .filter(slot => slot && slot.type === 'existing')
            .map(slot => slot.data);

        const finalNewFiles = imageSlots
            .filter(slot => slot && slot.type === 'new')
            .map(slot => slot.file);

        // Append existing images that the user wants to KEEP
        data.append('existingImages', JSON.stringify(finalExisting));

        finalNewFiles.forEach(file => {
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
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Product Images (Up to 5)</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                        {imageSlots.map((slot, idx) => (
                            <div key={idx} 
                                onClick={() => handleSlotClick(idx)}
                                style={{ 
                                    width: '120px',
                                    height: '120px', 
                                    border: slot ? '1px solid #ddd' : '2px dashed #ccc', 
                                    borderRadius: '8px',
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    backgroundColor: slot ? 'transparent' : '#f9f9f9',
                                    transition: 'all 0.2s ease',
                                    overflow: 'hidden'
                                }}>
                                {slot ? (
                                    <>
                                        <img 
                                            src={slot.type === 'existing' ? slot.data.url : slot.previewUrl} 
                                            alt={`Preview ${idx + 1}`} 
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                            referrerPolicy="no-referrer"
                                        />
                                        <button 
                                            type="button" 
                                            onClick={(e) => handleRemoveSlot(e, idx)} 
                                            style={{ 
                                                position: 'absolute', top: '5px', right: '5px', 
                                                background: 'red', color: 'white', border: 'none', 
                                                borderRadius: '50%', width: '22px', height: '22px', 
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                                cursor: 'pointer' 
                                            }}
                                        >
                                            <X size={14} />
                                        </button>
                                    </>
                                ) : (
                                    <div style={{ textAlign: 'center', color: '#888' }}>
                                        <Upload size={24} style={{ margin: '0 auto 5px' }} />
                                        <div style={{ fontSize: '0.8rem' }}>Image {idx + 1}</div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileSelect} 
                        accept="image/*" 
                        style={{ display: 'none' }} 
                    />
                </div>

                <button type="submit" className="btn-primary" style={{ marginTop: '2rem', width: '100%' }} disabled={loading}>
                    {loading ? 'Saving...' : (isEditMode ? 'Update Product' : 'Create Product')}
                </button>
            </form>
        </div>
    );
};

export default AdminProductForm;
