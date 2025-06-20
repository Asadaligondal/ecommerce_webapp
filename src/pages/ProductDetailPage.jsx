// client/src/pages/ProductDetailPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext'; // Import useCart
import './ProductDetailPage.css'; // Ensure you have this CSS file

// Remove or comment out any static 'product' data you might have here.

const ProductDetailPage = () => {
    const { productId } = useParams(); // Get product ID from URL
    const navigate = useNavigate();
    const { addToCart } = useCart(); // Use the addToCart function from context

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quantity, setQuantity] = useState(1); // State for quantity input

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/products/${productId}`); // Public API endpoint
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                if (data.success) {
                    setProduct(data.product);
                } else {
                    setError(data.message || 'Product not found.');
                }
            } catch (err) {
                console.error("Error fetching product details:", err);
                setError(err.message || 'Failed to load product details. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [productId]); // Re-run effect if productId changes

    const handleAddToCart = () => {
        if (product) {
            addToCart(product, quantity); // Pass product object and quantity
            alert(`${quantity} x ${product.name} added to cart!`);
            // Optionally navigate to cart page or show a toast
            // navigate('/cart');
        }
    };

    const handleQuantityChange = (e) => {
        const value = parseInt(e.target.value, 10);
        if (!isNaN(value) && value > 0 && value <= product.stock) { // Basic client-side stock check
            setQuantity(value);
        } else if (value > product.stock) {
            setQuantity(product.stock); // Set to max available stock
            alert(`Only ${product.stock} left in stock!`);
        } else if (value === 0) {
             setQuantity(1); // Prevent 0 or negative
        }
    };

    if (loading) {
        return <div className="product-detail-container">Loading product details...</div>;
    }

    if (error) {
        return <div className="product-detail-container error-message">Error: {error}</div>;
    }

    if (!product) {
        return <div className="product-detail-container no-product-found">Product not found.</div>;
    }

    return (
        <div className="product-detail-container">
            <div className="product-image-section">
                <img src={product.imageUrl} alt={product.name} className="product-detail-image" />
            </div>
            <div className="product-info-section">
                <h1 className="product-detail-title">{product.name}</h1>
                <p className="product-detail-price">${product.price.toFixed(2)}</p>
                <p className="product-detail-description">{product.description}</p>
                <p className="product-detail-stock">
                    {product.stock > 0 ? `In Stock: ${product.stock}` : <span style={{color: 'red'}}>Out of Stock</span>}
                </p>

                {product.stock > 0 && (
                    <div className="quantity-controls">
                        <label htmlFor="quantity">Quantity:</label>
                        <input
                            type="number"
                            id="quantity"
                            min="1"
                            max={product.stock}
                            value={quantity}
                            onChange={handleQuantityChange}
                            className="quantity-input"
                        />
                        <button onClick={handleAddToCart} className="add-to-cart-btn">
                            Add to Cart
                        </button>
                    </div>
                )}
                {product.stock === 0 && (
                    <button disabled className="add-to-cart-btn out-of-stock-btn">Out of Stock</button>
                )}

                <button onClick={() => navigate('/')} className="back-to-home-btn">
                    Back to Products
                </button>
            </div>
        </div>
    );
};

export default ProductDetailPage;