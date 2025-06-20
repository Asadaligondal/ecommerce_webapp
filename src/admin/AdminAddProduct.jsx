// client/src/admin/AdminAddProduct.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminAddProduct.css'; // We'll create this CSS file next

const AdminAddProduct = () => {
    const navigate = useNavigate();
    const [productData, setProductData] = useState({
        name: '',
        description: '',
        price: '', // Keep as string initially for input field
        imageUrl: '',
        stock: '', // Keep as string initially for input field
    });
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState(''); // 'success' or 'error'
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProductData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(''); // Clear previous messages
        setLoading(true);

        const token = localStorage.getItem('adminToken');
        if (!token) {
            setMessage('You are not authenticated. Please log in.');
            setMessageType('error');
            navigate('/admin/login');
            setLoading(false);
            return;
        }

        // Prepare data for backend (convert price and stock to numbers)
        const dataToSend = {
            ...productData,
            price: parseFloat(productData.price),
            stock: parseInt(productData.stock, 10),
        };

        // Basic client-side validation
        if (!dataToSend.name || !dataToSend.description || isNaN(dataToSend.price) || dataToSend.price <= 0 || !dataToSend.imageUrl || isNaN(dataToSend.stock) || dataToSend.stock < 0) {
            setMessage('Please fill all fields correctly. Price must be a positive number and Stock a non-negative integer.');
            setMessageType('error');
            setLoading(false);
            return;
        }


        try {
            const response = await fetch('http://localhost:5000/api/admin/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(dataToSend),
            });

            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem('adminToken');
                navigate('/admin/login');
                setMessage('Session expired or unauthorized. Please log in again.');
                setMessageType('error');
                return;
            }

            const result = await response.json();

            if (response.ok && result.success) {
                setMessage('Product added successfully!');
                setMessageType('success');
                // Optionally clear the form after success
                setProductData({
                    name: '',
                    description: '',
                    price: '',
                    imageUrl: '',
                    stock: '',
                });
            } else {
                setMessage(result.message || 'Failed to add product.');
                setMessageType('error');
            }
        } catch (err) {
            console.error("Error adding product:", err);
            setMessage('Network error or server unavailable.');
            setMessageType('error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-add-product-container">
            <h1 className="admin-add-product-title">Add New Product</h1>
            {message && <p className={`form-message ${messageType}`}>{message}</p>}
            <form onSubmit={handleSubmit} className="admin-add-product-form">
                <div className="form-group">
                    <label htmlFor="name">Product Name:</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={productData.name}
                        onChange={handleChange}
                        required
                        disabled={loading}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="description">Description:</label>
                    <textarea
                        id="description"
                        name="description"
                        value={productData.description}
                        onChange={handleChange}
                        required
                        disabled={loading}
                    ></textarea>
                </div>
                <div className="form-group">
                    <label htmlFor="price">Price ($):</label>
                    <input
                        type="number"
                        id="price"
                        name="price"
                        value={productData.price}
                        onChange={handleChange}
                        step="0.01"
                        min="0.01"
                        required
                        disabled={loading}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="imageUrl">Image URL:</label>
                    <input
                        type="url"
                        id="imageUrl"
                        name="imageUrl"
                        value={productData.imageUrl}
                        onChange={handleChange}
                        required
                        disabled={loading}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="stock">Stock Quantity:</label>
                    <input
                        type="number"
                        id="stock"
                        name="stock"
                        value={productData.stock}
                        onChange={handleChange}
                        min="0"
                        step="1"
                        required
                        disabled={loading}
                    />
                </div>
                <button type="submit" disabled={loading} className="add-product-btn">
                    {loading ? 'Adding Product...' : 'Add Product'}
                </button>
                <button type="button" onClick={() => navigate('/admin/orders')} className="back-to-admin-btn">
                    Back to Admin Dashboard
                </button>
            </form>
        </div>
    );
};

export default AdminAddProduct;