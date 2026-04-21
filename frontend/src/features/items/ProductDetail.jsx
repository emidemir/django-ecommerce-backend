import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../../style/items/productDetail.css';
import ReviewSection from '../reviews/ReviewSection';
import RelatedProducts from '../recommendations/RelatedProducts';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // New states for the Add to Cart action
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setIsLoading(true);
        const url = `${process.env.REACT_APP_BACKEND_URL}/products/${id}/`;
        
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("access")}`
          }
        });

        if (!response.ok) {
          if (response.status === 404) throw new Error("Product not found.");
          throw new Error("Failed to fetch product details.");
        }

        const data = await response.json();
        setProduct(data);
      } catch (err) {
        console.error("Detail Fetch Error:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);

  // The Add to Cart handler
  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      // Reusing your endpoint suffix logic
      const url = `${process.env.REACT_APP_BACKEND_URL}/cartitems/${id}/`;
      
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("access")}`
        },
        body: JSON.stringify({ quantity: quantity })
      });

      if (!response.ok) throw new Error("Could not add to cart.");

      alert(`${quantity} unit(s) of ${product.product_name} added to cart!`);
    } catch (err) {
      console.error("Cart Error:", err);
      alert("Failed to add to cart. Check your connection or login status.");
    } finally {
      setIsAdding(false);
    }
  };

  if (isLoading) return <div className="loading-state">Loading product details...</div>;
  if (error) return <div className="error-state">Error: {error}</div>;
  if (!product) return null;

  return (
    <div className="product-detail-page">
      <button className="back-btn" onClick={() => navigate(-1)}>← Back to Products</button>
      
      <div className="detail-container">
        <div className="detail-image">
          <img src={product.product_image?.url || 'https://via.placeholder.com/500'} alt={product.product_name} />
        </div>
        
        <div className="detail-info">
          <h1 className="detail-title">{product.product_name}</h1>
          <p className="detail-price">${product.product_price}</p>
          <p className="detail-description">{product.product_description}</p>
          
          {product.features && (
            <div className="detail-features">
              <h4>Key Features:</h4>
              <ul>
                {product.features.map((f, i) => <li key={i}>{f}</li>)}
              </ul>
            </div>
          )}

          <div className="detail-actions">
            <div className="qty-selector">
              <label>Quantity</label>
              <input 
                type="number" 
                value={quantity} 
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} 
                min="1" 
              />
            </div>
            <button 
              className="buy-now-btn" 
              onClick={handleAddToCart}
              disabled={isAdding}
            >
              {isAdding ? "Adding..." : "Add to Cart"}
            </button>
          </div>
        </div>
      </div>

      <ReviewSection productId={id} />
      <RelatedProducts category={product.category} />
    </div>
  );
};

export default ProductDetail;