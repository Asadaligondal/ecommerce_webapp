// client/src/admin/AdminOrderList.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './AdminOrderList.css';

const AdminOrderList = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate(); // <--- NEW

    useEffect(() => {
        const fetchOrders = async () => {
            const token = localStorage.getItem('adminToken'); // <--- Retrieve the token

            // --- NEW: Basic Frontend Auth Guard ---
            if (!token) {
                setError('You are not authenticated. Please log in.');
                setLoading(false);
                navigate('/admin/login'); // Redirect to login if no token
                return; // Stop execution
            }
            // --- END NEW Frontend Auth Guard ---

            try {
                const response = await fetch('http://localhost:5000/api/orders', {
                    headers: {
                        'Authorization': `Bearer ${token}` // <--- Include the token in headers
                    }
                });

                // --- NEW: Handle 401/403 responses (token expired/invalid) ---
                if (response.status === 401 || response.status === 403) {
                    localStorage.removeItem('adminToken'); // Clear invalid token
                    navigate('/admin/login'); // Redirect to login
                    setError('Session expired or unauthorized. Please log in again.');
                    return; // Stop execution
                }
                // --- END NEW Handle 401/403 responses ---

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                if (data.success) {
                    setOrders(data.orders);
                } else {
                    setError(data.message || 'Failed to fetch orders.');
                }
            } catch (err) {
                console.error("Error fetching orders:", err);
                setError('Failed to load orders. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [navigate]); // Add navigate to dependency array


 // --- NEW: Logout Handler ---
    const handleLogout = () => {
        localStorage.removeItem('adminToken'); // Remove the token from local storage
        navigate('/admin/login'); // Redirect to the admin login page
        console.log('Admin logged out.');
    };


    // ... (rest of your component's JSX remains the same) ...
    if (loading) {
        return <div className="admin-order-list-container">Loading orders...</div>;
    }

    if (error) {
        return <div className="admin-order-list-container error-message">Error: {error}</div>;
    }

    if (orders.length === 0) {
        return <div className="admin-order-list-container no-orders-message">No orders found.</div>;
    }

    return (
        <div className="admin-order-list-container">
            <div className="admin-header-controls">
            <h1 className="admin-order-list-title">All Orders</h1>
            <div className="admin-actions-group">
                <Link to="/admin/products" className="add-product-link-btn"> {/* <--- NEW Link to Product List */}
                    View All Products
                </Link>
                <Link to="/admin/products/add" className="add-product-link-btn">
                    Add New Product
                </Link>
                <button onClick={handleLogout} className="logout-btn">
                    Logout
                </button>
            </div>
        </div>
            <table className="admin-order-table">
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>Customer Name</th>
                        <th>Email</th>
                        <th>Total</th>
                        <th>Order Date</th>
                        <th>Status</th>
                        <th>Actions</th> {/* For future features like viewing details */}
                    </tr>
                </thead>
                <tbody>
                    {orders.map((order) => (
                        <tr key={order.orderId}>
                            <td>{order.orderId}</td>
                            <td>{order.deliveryInfo.fullName}</td>
                            <td>{order.deliveryInfo.email}</td>
                            <td>${order.grandTotal.toFixed(2)}</td>
                            <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                            <td>{order.status}</td>
                            <td>
                                {/* Link or button to view order details */}
                                <Link to={`/admin/orders/${order.orderid}`} className="view-details-btn">View Details</Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminOrderList;