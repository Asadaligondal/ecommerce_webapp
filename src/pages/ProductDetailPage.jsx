// src/pages/ProductDetailPage.jsx
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import productsData from '../data/products';
import { useCart } from '../context/CartContext';

import './ProductDetailPage.css';

function ProductDetailPage() {
  const { id } = useParams();
  const product = productsData.find(p => p.id === id);
  const { addToCart, cart } = useCart();

  // Check if product exists before rendering
  if (!product) {
    return <div className="product-detail-container">Product not found!</div>;
  }

  // Check if item is already in cart to disable button and show quantity
  const itemInCart = cart.find(item => item.productId === product.id);
  const isAlreadyInCart = !!itemInCart;

  return (
    <div className="product-detail-container">
      <div className="product-image-section">
        <img src={product.imageUrl} alt={product.name} className="product-detail-image" />
      </div>
      <div className="product-info-section">
        <h1 className="product-detail-name">{product.name}</h1>
        <p className="product-detail-category">Category: {product.category}</p>
        <p className="product-detail-price">${product.price.toFixed(2)}</p>

        {/* --- NEW: Product Description --- */}
        <div className="product-detail-description-section">
          <h3 className="product-detail-description-title">Product Description</h3>
          <p className="product-detail-description">{product.description}</p>
        </div>
        {/* --- END NEW --- */}

        <button
          onClick={() => addToCart(product.id)}
          className="add-to-cart-button"
          disabled={isAlreadyInCart} // Disable button if already in cart
        >
          {isAlreadyInCart ? `Added to Cart (${itemInCart.quantity})` : 'Add to Cart'}
        </button>
        <p>
          <Link to="/" className="back-to-home-link">&larr; Back to Products</Link>
        </p>
      </div>
    </div>
  );
}

export default ProductDetailPage;