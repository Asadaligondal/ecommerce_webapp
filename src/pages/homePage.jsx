// src/pages/HomePage.jsx
import React from 'react';
import productsData from '../data/products'; // Import our mock product data
import ProductCard from '../components/ProductCard'; // Import our ProductCard component
import { useCart } from '../context/CartContext';


function HomePage() {
  return (
    <div style={{ padding: '20px' }}>
      <h2>Our Products</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
        {/* List Rendering: Map over the productsData array */}
        {productsData.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

export default HomePage;