// src/pages/HomePage.jsx
import React, { useState } from 'react';
import productsData from '../data/products';
import ProductCard from '../components/ProductCard';

// --- NEW IMPORT FOR REACT ICONS (FaSearch) ---
import { FaSearch } from 'react-icons/fa';
// --- END NEW IMPORT ---

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
    <div className="homepage-container">
      <h2 className="homepage-title">Our Products</h2>

      <div className="filter-controls-modern">
        {/* --- MODIFIED SEARCH INPUT SECTION --- */}
        <div className="search-input-wrapper-modern"> {/* This div will get the rounded styling */}
          <FaSearch className="search-icon-modern" /> {/* The search icon */}
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input-modern"
          />
        </div>
        {/* --- END MODIFIED SEARCH INPUT SECTION --- */}

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="category-select-modern"
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
        <div className="product-grid">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
export default HomePage;