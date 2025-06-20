// src/pages/HomePage.jsx
import React, { useState, useEffect } from 'react';
import productsData from '../data/products';
import ProductCard from '../components/ProductCard';

// --- NEW IMPORT FOR REACT ICONS (FaSearch) ---
import { FaSearch } from 'react-icons/fa';
// --- END NEW IMPORT ---

import './HomePage.css';


const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
 const [searchTerm, setSearchTerm] = useState(''); // Keep this state for search
    const [inputSearchTerm, setInputSearchTerm] = useState(''); // NEW: For what's currently in the input field
  const [activeSearchTerm, setActiveSearchTerm] = useState('');
  useEffect(() => {
    const fetchProducts = async () => {

        setLoading(true);
      setError(null);
         let url = 'http://localhost:5000/api/products';
      const params = new URLSearchParams();

       if (activeSearchTerm) {
        params.append('search', activeSearchTerm);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      try {
        const response = await fetch(url); // Public API endpoint
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.success) {
          setProducts(data.products);
        } else {
          setError(data.message || 'Failed to fetch products.');
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [activeSearchTerm]); // Empty dependency array means this runs once on mount
const handleInputChange = (e) => {
    setInputSearchTerm(e.target.value);
  };

  // Handler for Search button click or Enter key press
  const handleSearchSubmit = () => {
    // Update activeSearchTerm, which triggers the useEffect
    setActiveSearchTerm(inputSearchTerm);
  };

  // Handler for Enter key press in the input field
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  };
  if (loading) {
    return <div className="home-page-container">Loading products...</div>;
  }

  if (error) {
    return <div className="home-page-container error-message">Error: {error}</div>;
  }

  if (products.length === 0) {
    return (
      <div className="home-page-container no-products-message">
        <p>No products found in the store. Please check back later!</p>
        {/* If you want to debug, you could add: <p>Admin can add products via /admin/products/add</p> */}
      </div>
    );
  }

  return (
    <div className="home-page-container">
      <h1 className="home-page-title">Welcome to Our Store!</h1>
      <div className="product-filters">
        <input
          type="text"
          placeholder="Search products by name or description..."
          value={inputSearchTerm} // Bind input to inputSearchTerm
          onChange={handleInputChange} // Use the new handler
          onKeyPress={handleKeyPress} // Listen for Enter key
          className="search-input"
        />
         <button onClick={handleSearchSubmit} className="search-button">
          Search
        </button>
        {/* REMOVE: The <select> dropdown for categories */}
      </div>
      {products.length === 0 && !loading && !error ? (
        <div className="no-products-message">
            <p>No products found matching your search. Try a different keyword.</p>
        </div>
      ) : (
        <div className="product-list-grid">
          {products.map((product) => (
            <ProductCard key={product.productId} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage;