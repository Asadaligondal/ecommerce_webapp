// client/src/admin/AdminOrderList.js

import React, { useState, useEffect } from 'react';
import './AdminOrderList.css'; // We'll create this CSS file next

const AdminOrderList = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/orders'); // Call your backend API
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
    }, []); // Empty dependency array means this runs once on mount

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
            <h1 className="admin-order-list-title">All Orders</h1>
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
                                <button className="view-details-btn">View Details</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminOrderList;