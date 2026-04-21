import React, { useState, useEffect } from 'react';
import ProductCard from '../../components/items/ProductCard';
import '../../style/items/productList.css';
import CategoryBar from '../../components/items/CategoryBar';

import { apiFetch } from '../../api/apiFetch'; 

const ProductList = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true); 

        const url = `${process.env.REACT_APP_BACKEND_URL}/products/`;
        
        // ✅ Swap out 'fetch' for 'apiFetch'
        // ✅ Remove manual header configuration; the wrapper handles it!
        const response = await apiFetch(url); 
        
        if (!response.ok) {
          throw new Error('Whoops! Failed to fetch products.');
        }

        const data = await response.json();
        setProducts(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []); 

  return (
    <div className="product-list-page">
      <CategoryBar 
        activeCategory={activeCategory} 
        onCategoryChange={setActiveCategory} 
      />
      
      <div className="product-list-container">
        <header className="list-header">
          <h1>Our Collection</h1>
          <p>Showing products for <strong>{activeCategory}</strong></p>
        </header>
        
        {isLoading && <div className="loading-message">Loading our awesome products...</div>}

        {error && <div className="error-message">Error: {error}</div>}

        {!isLoading && !error && products.length === 0 && (
          <div className="empty-message">No products found. Check back later!</div>
        )}
        
        {!isLoading && !error && products.length > 0 && (
          <div className="product-grid">
            {products
              .filter(p => activeCategory === "All" || p.category === activeCategory)
              .map(product => (
                <ProductCard key={product.id} product={product} />
              ))
            }
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductList;