import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/dashboard/Sidebar';
import { apiFetch } from '../../api/apiFetch'; // ✅ Import your secure wrapper
import '../../style/dashboard/dashboard.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        // ✅ Call your backend endpoint
        const url = `${process.env.REACT_APP_BACKEND_URL}/orders/`;
        const response = await apiFetch(url);

        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }

        const data = await response.json();
        setOrders(data);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("We couldn't load your orders right now. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Helper function to make Django's DateTime look nice in React
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown Date';
    const options = { year: 'numeric', month: 'long', day: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="dashboard-content">
        <h1>My Orders</h1>
        
        {/* Handle Loading & Error States */}
        {isLoading && <div className="loading-message">Loading your order history...</div>}
        {error && <div className="error-message">{error}</div>}
        
        {!isLoading && !error && orders.length === 0 && (
          <div className="empty-message">You haven't placed any orders yet. Time to go shopping!</div>
        )}

        {/* Render Table */}
        {!isLoading && !error && orders.length > 0 && (
          <div className="orders-table-wrapper">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    {/* UUIDs are huge, so we split at the first dash to make a nice short ID */}
                    <td>#{order.id ? order.id.split('-')[0].toUpperCase() : 'UNKNOWN'}</td>
                    
                    {/* Format the created_at timestamp */}
                    <td>{formatDate(order.created_at)}</td>
                    
                    <td>${order.total_price}</td>
                    
                    <td>
                      <span className={`status-badge ${order.status ? order.status.toLowerCase() : 'pending'}`}>
                        {order.status || 'Pending'}
                      </span>
                    </td>
                    
                    <td><button className="view-details-btn">View</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

export default Orders;