// client/src/admin/AdminProductList.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Import Link for navigation
import './AdminProductList.css'; // We'll create this CSS file next

const AdminProductList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteMessage, setDeleteMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProducts = async () => {
            const token = localStorage.getItem('adminToken');

            // Basic Frontend Auth Guard
            if (!token) {
                setError('You are not authenticated. Please log in.');
                setLoading(false);
                navigate('/admin/login');
                return;
            }

            try {
                const response = await fetch('http://localhost:5000/api/admin/products', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                // Handle 401/403 responses (token expired/invalid)
                if (response.status === 401 || response.status === 403) {
                    localStorage.removeItem('adminToken');
                    navigate('/admin/login');
                    setError('Session expired or unauthorized. Please log in again.');
                    return;
                }

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                if (data.success) {
                    setProducts(data.products);
                } else {
                    setError(data.message || 'Failed to fetch products.');
                }
            } catch (err) {
                console.error("Error fetching products:", err);
                setError('Failed to load products. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [navigate]); // navigate is a dependency of useEffect

    // Basic Logout Handler (can be moved to a central admin layout later)
    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
        console.log('Admin logged out.');
    };

 // --- NEW: Delete Product Handler ---
    const handleDeleteProduct = async (productId) => {
        if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
            return; // User cancelled
        }

        setDeleteMessage(''); // Clear previous messages
        const token = localStorage.getItem('adminToken');
        if (!token) {
            navigate('/admin/login');
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/admin/products/${productId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem('adminToken');
                navigate('/admin/login');
                setDeleteMessage({ type: 'error', text: 'Session expired or unauthorized. Please log in again.' });
                return;
            }

            const result = await response.json();

            if (response.ok && result.success) {
                setDeleteMessage({ type: 'success', text: `Product "${result.deletedProduct.name}" deleted successfully!` });
                // Remove the deleted product from the state immediately
                setProducts(prevProducts => prevProducts.filter(p => p.productId !== productId));
            } else {
                setDeleteMessage({ type: 'error', text: result.message || 'Failed to delete product.' });
            }
        } catch (err) {
            console.error("Error deleting product:", err);
            setDeleteMessage({ type: 'error', text: 'Network error or server unavailable during product deletion.' });
        }
    };
    if (loading) {
        return <div className="admin-product-list-container">Loading products...</div>;
    }

    if (error) {
        return <div className="admin-product-list-container error-message">Error: {error}</div>;
    }

    if (products.length === 0) {
        return (
            <div className="admin-product-list-container no-products-message">
                <p>No products found. <Link to="/admin/products/add">Add a new product?</Link></p>
                <div className="admin-actions-group top-actions"> {/* Reusing class for consistency */}
                    <button onClick={handleLogout} className="logout-btn">
                        Logout
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-product-list-container">
            <div className="admin-header-controls">
                <h1 className="admin-product-list-title">All Products</h1>
                <div className="admin-actions-group">
                    <Link to="/admin/products/add" className="add-product-link-btn">
                        Add New Product
                    </Link>
                     <Link to="/admin/orders" className="add-product-link-btn" style={{backgroundColor: '#6c757d'}}>
                    Back to Orders
                </Link>
                    <button onClick={handleLogout} className="logout-btn">
                        Logout
                    </button>
                </div>
            </div>

            <table className="admin-product-table">
                <thead>
                    <tr>
                        <th>Product ID</th>
                        <th>Image</th>
                        <th>Name</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((product) => (
                        <tr key={product.productId}>
                            <td>{product.productId.substring(0, 8)}</td>
                            <td>
                                <img
                                    src={product.imageUrl}
                                    alt={product.name}
                                    className="product-thumbnail"
                                />
                            </td>
                            <td>{product.name}</td>
                            <td>${product.price.toFixed(2)}</td>
                            <td>{product.stock}</td>
                            <td>
                                <Link to={`/admin/products/edit/${product.productId}`} className="action-btn edit-btn">
                                    Edit
                                </Link>
                                <button
                                    onClick={() => handleDeleteProduct(product.productId)}
                                    className="action-btn delete-btn"
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminProductList;