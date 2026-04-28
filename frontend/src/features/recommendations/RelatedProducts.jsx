import React, { useState, useEffect } from 'react';
import ProductCarousel from '../../components/items/ProductCarousel';
import '../../style/items/carousel.css'; 

const RelatedProducts = ({ productId }) => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!productId) return; 

      try {
        setIsLoading(true);
        const url = `${process.env.REACT_APP_BACKEND_URL}/suggesteds/${productId}/`;
        
        // Use standard fetch here! Viewing suggestions is a public action.
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error("Failed to load suggestions.");
        }

        const data = await response.json();
        
        // ✅ The backend now returns a clean object with a 'suggested_products' array!
        // No more JSON.parse() or mapping needed.
        setProducts(data.suggested_products || []);
        
      } catch (err) {
        console.error("Suggestions Fetch Error:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestions();
  }, [productId]);

  // Hide the section if there are no suggestions
  if (!isLoading && !error && products.length === 0) {
    return null;
  }

  return (
    <section className="related-products">
      <h3 className="section-title">You Might Also Like</h3>
      
      {isLoading ? (
        <div className="loading-message">Finding similar items...</div>
      ) : error ? (
        <div className="error-message">Could not load suggestions at this time.</div>
      ) : (
        <ProductCarousel products={products} />
      )}
    </section>
  );
};

export default RelatedProducts;