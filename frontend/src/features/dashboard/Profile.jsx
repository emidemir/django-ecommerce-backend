import React, { useState } from 'react';
import Sidebar from '../../components/dashboard/Sidebar';
import '../../style/dashboard/profile.css';

const Profile = () => {
  const [userData, setUserData] = useState({
    fullName: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 234 567 890',
    address: '123 Tech Lane, Silicon Valley, CA'
  });

  const handleUpdate = (e) => {
    e.preventDefault();
    alert("Profile updated successfully!");
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="dashboard-content">
        <header className="content-header">
          <h1>My Profile</h1>
          <p>Manage your personal information and security.</p>
        </header>

        <section className="profile-section">
          <form onSubmit={handleUpdate} className="profile-form">
            <div className="form-section">
              <h3>Personal Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" value={userData.fullName} 
                    onChange={(e) => setUserData({...userData, fullName: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" value={userData.email} disabled />
                  <small>Email cannot be changed.</small>
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input type="tel" value={userData.phone} 
                    onChange={(e) => setUserData({...userData, phone: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Shipping Address</label>
                  <input type="text" value={userData.address} 
                    onChange={(e) => setUserData({...userData, address: e.target.value})} />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Change Password</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Current Password</label>
                  <input type="password" placeholder="••••••••" />
                </div>
                <div className="form-group">
                  <label>New Password</label>
                  <input type="password" placeholder="New password" />
                </div>
              </div>
            </div>

            <button type="submit" className="save-profile-btn">Save Changes</button>
          </form>
        </section>
      </main>
    </div>
  );
};

export default Profile;