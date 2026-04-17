import React, { useState } from 'react';
import ReviewCard from '../../components/reviews/ReviewCard';
import '../../style/reviews/review.css';

const ReviewSection = ({ productId }) => {
  const [reviews, setReviews] = useState([
    { id: 1, user: "Alex J.", rating: 5, comment: "Absolutely love the minimalist design!", date: "2026-04-10" },
    { id: 2, user: "Sarah K.", rating: 4, comment: "Great quality, but the shipping took a bit longer than expected.", date: "2026-04-12" }
  ]);

  return (
    <section className="reviews-section">
      <h3>Customer Reviews</h3>
      
      <div className="review-form-container">
        <h4>Leave a Review</h4>
        <form className="review-form">
          <textarea placeholder="Share your thoughts about this product..." rows="4"></textarea>
          <div className="form-footer">
            <select>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
            </select>
            <button type="submit" className="submit-review-btn">Post Review</button>
          </div>
        </form>
      </div>

      <div className="reviews-list">
        {reviews.map(r => <ReviewCard key={r.id} review={r} />)}
      </div>
    </section>
  );
};

export default ReviewSection;