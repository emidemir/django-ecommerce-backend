import React from 'react';
import '../../style/reviews/review.css';

const ReviewCard = ({ review }) => {
  return (
    <div className="review-card">
      <div className="review-header">
        <span className="review-user">{review.username}</span>
        <span className="review-rating">{'★'.repeat(review.rating)}{'☆'.repeat(5-review.rating)}</span>
      </div>
      <p className="review-text">{review.comment}</p>
      <span className="review-date">
        {new Date(review.date).toLocaleString()}
      </span>
    </div>
  );
};

export default ReviewCard;