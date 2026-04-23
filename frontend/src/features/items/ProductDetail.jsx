import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../../style/items/productDetail.css';
import ReviewSection from '../reviews/ReviewSection';
import RelatedProducts from '../recommendations/RelatedProducts';

// ✅ Import your custom fetch wrapper and auth context
import { apiFetch } from '../../api/apiFetch';
import { useAuth } from '../../context/AuthContext';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth(); // 👈 Grab the user from context

  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setIsLoading(true);
        const url = `${process.env.REACT_APP_BACKEND_URL}/products/${id}/`;
        
        // ✅ Replaced fetch with apiFetch. No headers needed for GET!
        const response = await apiFetch(url);

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

  const handleAddToCart = async () => {
    // ✅ Safety check: ensure the user is logged in
    if (!user || !user.cartID) {
      alert("Please log in to add items to your cart!");
      return; 
    }

    setIsAdding(true);
    try {
      const url = `${process.env.REACT_APP_BACKEND_URL}/cartitems/`;
      
      // ✅ Replaced fetch with apiFetch. Headers handled automatically!
      const response = await apiFetch(url, {
        method: "POST",
        body: JSON.stringify({ quantity: quantity, product: id, cart: user.cartID })
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

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // RESET the carousel when a new product loads
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [product?.id]);
  // Safely go to the next image (loops back to start if at the end)
  const nextImage = () => {
    if (product?.product_image) {
      setCurrentImageIndex((prev) => 
        prev === product.product_image.length - 1 ? 0 : prev + 1
      );
    }
  };

  // Safely go to the previous image (loops to the end if at the start)
  const prevImage = () => {
    if (product?.product_image) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? product.product_image.length - 1 : prev - 1
      );
    }
  };

  if (isLoading) return <div className="loading-state">Loading product details...</div>;
  if (error) return <div className="error-state">Error: {error}</div>;
  if (!product) return null;

  return (
    <div className="product-detail-page">
      <button className="back-btn" onClick={() => navigate(-1)}>← Back to Products</button>
      
      <div className="detail-container">
      <div className="detail-image carousel-container">
          {/* Strict check: Ensure product_image exists, is an array, 
            has length > 0, AND that the current index actually exists 
          */}
          {Array.isArray(product?.product_image) && product.product_image.length > 0 && product.product_image[currentImageIndex] ? (
            <>
              {product.product_image.length > 1 && (
                <button 
                  className="carousel-arrow left-arrow" 
                  onClick={prevImage}
                  style={{ position: 'absolute', left: '10px', top: '50%' }} // temporary inline style to ensure it shows up
                >
                  &#10094;
                </button>
              )}

              <img 
                src={product.product_image[currentImageIndex].url || 'https://via.placeholder.com/500'} 
                alt={`${product.product_name} - view ${currentImageIndex + 1}`} 
                className="main-carousel-image"
                style={{ width: '100%', objectFit: 'contain' }} // Ensures it doesn't break layout
              />

              {product.product_image.length > 1 && (
                <button 
                  className="carousel-arrow right-arrow" 
                  onClick={nextImage}
                  style={{ position: 'absolute', right: '10px', top: '50%' }}
                >
                  &#10095;
                </button>
              )}
            </>
          ) : (
            // Absolute fallback if the array is missing, empty, or malformed
            <img 
              src='https://via.placeholder.com/500' 
              alt={product?.product_name || 'Product'} 
              style={{ width: '100%', objectFit: 'contain' }} 
            />
          )}
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