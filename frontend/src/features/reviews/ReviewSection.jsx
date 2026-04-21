import React, { useState, useEffect } from 'react';
import ReviewCard from '../../components/reviews/ReviewCard';
import { apiFetch } from '../../api/apiFetch'; 
import { useAuth } from '../../context/AuthContext'; 
import '../../style/reviews/review.css';

const ReviewSection = ({ productId }) => {
  const { user } = useAuth(); 
  const [reviews, setReviews] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [rating, setRating] = useState(5);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Fetch existing comments on component mount (PUBLIC)
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const url = `${process.env.REACT_APP_BACKEND_URL}/comments/?product=${productId}`;
        
        // ✅ Use standard fetch here! 
        // Guests need to read reviews without triggering auth errors.
        const response = await fetch(url); 
        
        if (!response.ok) throw new Error("Failed to load reviews.");
        
        const data = await response.json();
        setReviews(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchComments();
  }, [productId]);

  // 2. Handle posting a new review (AUTHENTICATED)
  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Safety check: Is the user logged in?
    if (!user) {
      return alert("Please log in to post a review!"); 
    }

    try {
      const url = `${process.env.REACT_APP_BACKEND_URL}/comments/`;
      
      // ✅ Use apiFetch here! Posting requires auth and headers.
      const response = await apiFetch(url, {
        method: "POST", 
        body: JSON.stringify({
          product: productId,
          comment: commentText,
          rating: parseInt(rating), // Ensure rating is a number, not a string
          user: user.id 
        }) 
      });

      if (!response.ok) throw new Error("Failed to post review.");

      const newReview = await response.json();
      setReviews((prev) => [newReview, ...prev]); // Update UI instantly
      setCommentText(""); // Clear text form
      setRating(5); // Reset rating
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <section className="reviews-section">
      <h3>Customer Reviews</h3>
      
      <div className="review-form-container">
        <h4>Leave a Review</h4>
        <form className="review-form" onSubmit={handleSubmit}>
          <textarea 
            placeholder="Share your thoughts about this product..." 
            rows="4"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            required
          ></textarea>
          <div className="form-footer">
            <select value={rating} onChange={(e) => setRating(e.target.value)}>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
            <button type="submit" className="submit-review-btn">Post Review</button>
          </div>
        </form>
      </div>

      <div className="reviews-list">
        {isLoading ? (
          <p>Loading reviews...</p>
        ) : (
          reviews.length > 0 ? (
            reviews.map(r => <ReviewCard key={r.id} review={r} />)
          ) : (
            <p>No reviews yet. Be the first to review this product!</p>
          )
        )}
      </div>
    </section>
  );
};

export default ReviewSection;