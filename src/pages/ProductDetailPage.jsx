// src/pages/ProductDetailPage.jsx
import React from 'react';
import {useParams, Link} from 'react-router-dom'
import productsData from '../data/products'
import { useCart } from '../context/CartContext';


function ProductDetailPage() { // 1. Use useParams to get the 'id' from the URL
  const { id } = useParams();
  const {addToCart} = useCart()

  // 2. Find the product that matches the ID from our productsData
  const product = productsData.find(p => p.id === id);

  // 3. Handle case where product is not found (e.g., direct access to a non-existent ID)
  if (!product) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Product Not Found</h2>
        <p>The product you are looking for does not exist.</p>
        <Link to="/" style={{ color: '#007bff', textDecoration: 'none' }}>Go back to Home</Link>
      </div>
    );
  }

  // 4. Render the product details if found
  return (
    <div style={{ padding: '20px', display: 'flex', gap: '40px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
      <div style={{ flex: '1', minWidth: '300px', maxWidth: '400px' }}>
        <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: 'auto', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }} />
      </div>
      <div style={{ flex: '2', minWidth: '300px' }}>
        <h1>{product.name}</h1>
        <p style={{ fontSize: '1.5em', fontWeight: 'bold', color: '#333' }}>${product.price.toFixed(2)}</p>
        <p>{product.description}</p>
        <button onClick={()=>addToCart(product)}
         style={{ background: '#28a745', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '5px', cursor: 'pointer', fontSize: '1.1em', marginTop: '20px' }}>
          Add to Cart
        </button>
        <p style={{ marginTop: '30px' }}>
          <Link to="/" style={{ color: '#007bff', textDecoration: 'none' }}>&larr; Back to Products</Link>
        </p>
      </div>
    </div>
  );
}

export default ProductDetailPage;