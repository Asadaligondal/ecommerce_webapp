// src/pages/HomePage.jsx
import React, { useState } from 'react';
import productsData from '../data/products';
import ProductCard from '../components/ProductCard';

// Import the new HomePage.css
import './HomePage.css';

function HomePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', ...new Set(productsData.map(product => product.category))];

  const filteredProducts = productsData.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="homepage-container"> {/* Use className */}
      <h2 className="homepage-title">Our Products</h2> {/* Use className */}

      <div className="filter-search-controls"> {/* Use className */}
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      {filteredProducts.length === 0 ? (
        <p className="no-products-message">
          No products found matching your criteria.
        </p>
      ) : (
        <div className="product-grid"> {/* Use className */}
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
export default HomePage;