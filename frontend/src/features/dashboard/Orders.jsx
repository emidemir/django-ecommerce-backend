import React from 'react';
import Sidebar from '../../components/dashboard/Sidebar';
import '../../style/dashboard/dashboard.css';

const Orders = () => {
  const mockOrders = [
    { id: '#ORD-9921', date: 'April 05, 2026', total: 120, status: 'Delivered' },
    { id: '#ORD-8812', date: 'March 12, 2026', total: 245, status: 'Shipped' },
  ];

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="dashboard-content">
        <h1>My Orders</h1>
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
              {mockOrders.map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.date}</td>
                  <td>${order.total}</td>
                  <td><span className={`status-badge ${order.status.toLowerCase()}`}>{order.status}</span></td>
                  <td><button className="view-details-btn">View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default Orders;