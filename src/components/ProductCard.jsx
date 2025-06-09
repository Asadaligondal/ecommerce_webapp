// src/components/ProductCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

// Import the new ProductCard.css
import './ProductCard.css';

function ProductCard({ product }) {
  const { addToCart } = useCart();

  return (
    <div className="product-card"> {/* Use className */}
      <Link to={`/products/${product.id}`} className="product-card-link"> {/* Use className */}
        <img src={product.imageUrl} alt={product.name} className="product-card-img" /> {/* Use className */}
        <h3>{product.name}</h3>
        <p>${product.price.toFixed(2)}</p>
      </Link>
      <button
        onClick={() => addToCart(product)}
        className="product-card-button" 
      >
        Add to Cart
      </button>
    </div>
  );
}
export default ProductCard;