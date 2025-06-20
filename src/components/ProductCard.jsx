// client/src/components/ProductCard.jsx (Verify this structure)

import React from 'react';
import { Link } from 'react-router-dom';
import './ProductCard.css';
import { useCart } from '../context/CartContext';
const ProductCard = ({ product }) => { // Expects a 'product' object prop
  // Ensure product.id or product.productId is used for the link
  const productLink = `/products/${product.productId}`; // Use productId
  const { addToCart } = useCart();

  const handleAddToCart = (e) => {
    e.preventDefault(); // Prevent navigating to product detail page when clicking the button
    e.stopPropagation(); // Stop event from bubbling up to the Link
      // DEBUG: Log the product being added
  console.log("Product being added to cart:", product);
  console.log("Product price:", product.price);
  console.log("Product productId:", product.productId);
    if (product.stock > 0) {
        addToCart(product, 1); // Add 1 quantity of this product to the cart
        
    } else {
        alert(`${product.name} is out of stock!`);
    }
  };

  return (
    <div className="product-card">
      <Link to={productLink}>
        <img src={product.imageUrl} alt={product.name} className="product-card-image" />
      </Link>
      <div className="product-card-details">
        <h3 className="product-card-title">
          <Link to={productLink}>{product.name}</Link>
        </h3>
        <p className="product-card-price">${product.price ? product.price.toFixed(2) : 'N/A'}</p>
        {/* You might want to add stock info here eventually */}
      </div>
      {/* Add to Cart button can go here or be part of ProductDetailPage */}
      {/* <button className="add-to-cart-btn">Add to Cart</button> */}
      {product.stock > 0 ? (
        <button onClick={handleAddToCart} className="add-to-cart-btn">
          Add to Cart
        </button>
      ) : (
        <button disabled className="add-to-cart-btn out-of-stock-btn">
          Out of Stock
        </button>
      )}
    </div>
  );
};

export default ProductCard;