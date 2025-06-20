// client/src/admin/AdminOrderDetail.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Import useParams and useNavigate
import './AdminOrderDetail.css'; // We'll create this CSS file next

const AdminOrderDetail = () => {
    const { orderId } = useParams(); // Get orderId from the URL parameters
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState(''); // <--- NEW STATE
    const [updateMessage, setUpdateMessage] = useState(''); // <--- NEW STATE for feedback
    const [isUpdating, setIsUpdating] = useState(false); // <--- NEW STATE for loading indicator

    useEffect(() => {
        const fetchOrderDetail = async () => {
            const token = localStorage.getItem('adminToken'); // Retrieve the token

            // Basic Frontend Auth Guard
            if (!token) {
                setError('You are not authenticated. Please log in.');
                setLoading(false);
                navigate('/admin/login');
                return;
            }

            try {
                const response = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}` // Include the token in headers
                    }
                });

                // Handle 401/403 responses (token expired/invalid)
                if (response.status === 401 || response.status === 403) {
                    localStorage.removeItem('adminToken'); // Clear invalid token
                    navigate('/admin/login');
                    setError('Session expired or unauthorized. Please log in again.');
                    return;
                }

                if (!response.ok) {
                    // Check for 404 specifically for 'Order not found'
                    if (response.status === 404) {
                        setError('Order not found.');
                        setOrder(null); // Ensure no old order data is shown
                    } else {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                } else {
                    const data = await response.json();
                    if (data.success) {
                        setOrder(data.order);
                    } else {
                        setError(data.message || 'Failed to fetch order details.');
                    }
                }
            } catch (err) {
                console.error("Error fetching order details:", err);
                setError('Failed to load order details. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchOrderDetail();
    }, [orderId, navigate]); // Rerun effect if orderId changes or navigate changes

const handleStatusUpdate = async () => {
        if (!selectedStatus) {
            setUpdateMessage({ type: 'error', text: 'Please select a new status.' });
            return;
        }

        setIsUpdating(true);
        setUpdateMessage(''); // Clear previous messages

        const token = localStorage.getItem('adminToken');
        if (!token) {
            // Should ideally not happen if useEffect guard works, but good fallback
            localStorage.removeItem('adminToken');
            navigate('/admin/login');
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: selectedStatus })
            });

            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem('adminToken');
                navigate('/admin/login');
                setUpdateMessage({ type: 'error', text: 'Session expired or unauthorized. Please log in again.' });
                return;
            }

            const data = await response.json();

            if (response.ok && data.success) {
                // Update the local order state with the new status returned by the backend
                setOrder(data.order);
                setUpdateMessage({ type: 'success', text: `Status updated to "${selectedStatus}" successfully!` });
                setSelectedStatus(''); // Reset dropdown
            } else {
                setUpdateMessage({ type: 'error', text: data.message || 'Failed to update status.' });
            }
        } catch (err) {
            console.error("Error updating order status:", err);
            setUpdateMessage({ type: 'error', text: 'Network error or server unavailable during status update.' });
        } finally {
            setIsUpdating(false);
        }
    };


    if (loading) {
        return <div className="admin-order-detail-container">Loading order details...</div>;
    }

    if (error) {
        return (
            <div className="admin-order-detail-container error-message">
                <p>{error}</p>
                {error === 'Order not found.' && (
                    <button onClick={() => navigate('/admin/orders')} className="back-to-list-btn">
                        Back to Order List
                    </button>
                )}
            </div>
        );
    }

    if (!order) {
        return <div className="admin-order-detail-container no-order-message">No order data available.</div>;
    }

    return (
        <div className="admin-order-detail-container">
            <h1 className="admin-order-detail-title">Order Details: {order.orderid}</h1> {/* Use orderid from data */}
            <div className="order-summary-card">
                <p><strong>Status:</strong> {order.status}</p>
                <p><strong>Order Date:</strong> {new Date(order.orderDate).toLocaleDateString()} at {new Date(order.orderDate).toLocaleTimeString()}</p>
                <p><strong>Subtotal:</strong> ${order.subtotal.toFixed(2)}</p>
                <p><strong>Shipping:</strong> ${order.shipping.toFixed(2)}</p>
                <p><strong>Grand Total:</strong> ${order.grandTotal.toFixed(2)}</p>
            </div>

            <div className="status-update-card">
            <h2>Update Status</h2>
            {updateMessage.text && (
    <p className={`status-update-message ${updateMessage.type}`}>
        {updateMessage.text}
    </p>
)}
            <div className="status-controls">
                <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    disabled={isUpdating}
                    className="status-select"
                >
                    <option value="">Select New Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                </select>
                <button
                    onClick={handleStatusUpdate}
                    disabled={!selectedStatus || isUpdating}
                    className="update-status-btn"
                >
                    {isUpdating ? 'Updating...' : 'Update Status'}
                </button>
            </div>
        </div>

            <div className="delivery-info-card">
                <h2>Delivery Information</h2>
                <p><strong>Full Name:</strong> {order.deliveryInfo.fullName}</p>
                <p><strong>Email:</strong> {order.deliveryInfo.email}</p>
                <p><strong>Phone:</strong> {order.deliveryInfo.phone}</p>
                <p><strong>Address:</strong> {order.deliveryInfo.address}, {order.deliveryInfo.city}, {order.deliveryInfo.zipCode}</p>
                <p><strong>Country:</strong> {order.deliveryInfo.country}</p>
            </div>

            <div className="items-list-card">
                <h2>Items Ordered</h2>
                <table className="items-table">
                    <thead>
                        <tr>
                            <th>Product Name</th>
                            <th>Price</th>
                            <th>Quantity</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.items.map((item, index) => (
                            <tr key={index}>
                                <td>{item.name}</td>
                                <td>${item.price.toFixed(2)}</td>
                                <td>{item.quantity}</td>
                                <td>${(item.price * item.quantity).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <button onClick={() => navigate('/admin/orders')} className="back-to-list-btn">
                Back to Order List
            </button>
        </div>
    );
};

export default AdminOrderDetail;