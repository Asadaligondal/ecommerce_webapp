// src/components/OrderConfirmationModal.jsx
import React from 'react';
import './OrderConfirmationModal.css'; // We'll create this CSS file next

const OrderConfirmationModal = ({ show, onClose, orderDetails }) => {
  if (!show) {
    return null; // Don't render anything if the modal is not visible
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close-button" onClick={onClose}>
          &times; {/* This is a multiplication sign, commonly used for close buttons */}
        </button>
        <h2 className="modal-title">Order Confirmed! 🎉</h2>
        <p className="modal-message">
          Thank you for your purchase! Your order **#{orderDetails.orderId || 'N/A'}** has been placed successfully.
        </p>
        <p className="modal-message">
          You will receive a confirmation email at **{orderDetails.email || 'your provided email'}** shortly with details about your order and tracking information.
        </p>
        <div className="modal-summary">
            <h4>Order Summary:</h4>
            <p>Total Items: **{orderDetails.totalItems || 0}**</p>
            <p>Grand Total: **${orderDetails.grandTotal ? orderDetails.grandTotal.toFixed(2) : '0.00'}**</p>
        </div>
        <button className="modal-ok-button" onClick={onClose}>
          Got It!
        </button>
      </div>
    </div>
  );
};

export default OrderConfirmationModal;