import React, { useState, useEffect } from 'react';
import ProductCard from '../../components/items/ProductCard';
import '../../style/items/productList.css';
import CategoryBar from '../../components/items/CategoryBar';

const ProductList = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  
  // New state variables for fetching data
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Set loading to true in case this is called again later
        setIsLoading(true); 

        const url = `${process.env.REACT_APP_BACKEND_URL}/products/`
        
        // Insert your backend URL here
        const response = await fetch(url,{
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("access")}`

          }
        }); 
        
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
  }, []); // Empty dependency array means this runs once when the component mounts

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
        
        {/* Handle Loading State */}
        {isLoading && <div className="loading-message">Loading our awesome products...</div>}

        {/* Handle Error State */}
        {error && <div className="error-message">Error: {error}</div>}

        {/* Handle Empty State (Optional but recommended) */}
        {!isLoading && !error && products.length === 0 && (
          <div className="empty-message">No products found. Check back later!</div>
        )}

        {/* Render the grid only when we have data and aren't loading */}
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