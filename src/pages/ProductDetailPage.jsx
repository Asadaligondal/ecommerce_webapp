// src/pages/ProductDetailPage.jsx
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import productsData from '../data/products';
import { useCart } from '../context/CartContext';

// Import the new ProductDetailPage.css
import './ProductDetailPage.css';

function ProductDetailPage() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const product = productsData.find(p => p.id === id);

  if (!product) {
    return (
      <div className="product-not-found-container"> {/* Added a class for consistency */}
        <h2>Product Not Found</h2>
        <p>The product you are looking for does not exist.</p>
        <Link to="/" className="back-to-products-link">Go back to Home</Link> {/* Used existing class */}
      </div>
    );
  }

  return (
    <div className="product-detail-container"> {/* Use className */}
      <div className="product-detail-image-wrapper"> {/* Use className */}
        <img src={product.imageUrl} alt={product.name} className="product-detail-image" /> {/* Use className */}
      </div>
      <div className="product-detail-info"> {/* Use className */}
        <h1>{product.name}</h1>
        <p className="product-detail-price">${product.price.toFixed(2)}</p> {/* Use className */}
        <p className="product-detail-description">{product.description}</p> {/* Use className */}
        <button
          onClick={() => addToCart(product)}
          className="add-to-cart-button" 
        >
          Add to Cart
        </button>
        <p>
          <Link to="/" className="back-to-products-link">&larr; Back to Products</Link> {/* Use className */}
        </p>
      </div>
    </div>
  );
}

export default ProductDetailPage;