// client/src/admin/AdminEditProduct.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './AdminAddProduct.css'; // Reusing the CSS from Add Product for consistency

const AdminEditProduct = () => {
    const { productId } = useParams(); // Get productId from URL
    const navigate = useNavigate();
    const [productData, setProductData] = useState({
        name: '',
        description: '',
        price: '',
        imageUrl: '',
        stock: '',
    });
    const [loading, setLoading] = useState(true); // For initial data fetch
    const [isUpdating, setIsUpdating] = useState(false); // For form submission
    const [error, setError] = useState(null); // For initial data fetch errors
    const [message, setMessage] = useState(''); // For update feedback
    const [messageType, setMessageType] = useState(''); // 'success' or 'error'

    // Effect to fetch existing product data when component mounts
    useEffect(() => {
        const fetchProduct = async () => {
            const token = localStorage.getItem('adminToken');
            if (!token) {
                navigate('/admin/login');
                return;
            }

            try {
                const response = await fetch(`http://localhost:5000/api/admin/products/${productId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.status === 401 || response.status === 403) {
                    localStorage.removeItem('adminToken');
                    navigate('/admin/login');
                    return;
                }

                if (!response.ok) {
                    const errData = await response.json();
                    throw new Error(errData.message || 'Failed to fetch product for editing.');
                }

                const data = await response.json();
                if (data.success) {
                    // Pre-fill form with existing product data
                    setProductData({
                        name: data.product.name,
                        description: data.product.description,
                        price: data.product.price.toString(), // Convert to string for input type="number"
                        imageUrl: data.product.imageUrl,
                        stock: data.product.stock.toString(), // Convert to string
                    });
                } else {
                    setError(data.message || 'Product not found.');
                }
            } catch (err) {
                console.error("Error fetching product for edit:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [productId, navigate]); // Re-run if productId or navigate changes

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProductData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setMessageType('');
        setIsUpdating(true);

        const token = localStorage.getItem('adminToken');
        if (!token) {
            localStorage.removeItem('adminToken');
            navigate('/admin/login');
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
            setIsUpdating(false);
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/admin/products/${productId}`, {
                method: 'PUT',
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
                setMessage('Product updated successfully!');
                setMessageType('success');
                // Optionally, you might navigate back to the product list here:
                // navigate('/admin/products');
            } else {
                setMessage(result.message || 'Failed to update product.');
                setMessageType('error');
            }
        } catch (err) {
            console.error("Error updating product:", err);
            setMessage('Network error or server unavailable.');
            setMessageType('error');
        } finally {
            setIsUpdating(false);
        }
    };

    if (loading) {
        return <div className="admin-add-product-container">Loading product data...</div>;
    }

    if (error) {
        return <div className="admin-add-product-container error-message">Error: {error}</div>;
    }

    return (
        <div className="admin-add-product-container">
            <h1 className="admin-add-product-title">Edit Product: {productData.name}</h1>
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
                        disabled={isUpdating}
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
                        disabled={isUpdating}
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
                        disabled={isUpdating}
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
                        disabled={isUpdating}
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
                        disabled={isUpdating}
                    />
                </div>
                <button type="submit" disabled={isUpdating} className="add-product-btn">
                    {isUpdating ? 'Updating Product...' : 'Update Product'}
                </button>
                <button type="button" onClick={() => navigate('/admin/products')} className="back-to-admin-btn">
                    Back to Product List
                </button>
            </form>
        </div>
    );
};

export default AdminEditProduct;