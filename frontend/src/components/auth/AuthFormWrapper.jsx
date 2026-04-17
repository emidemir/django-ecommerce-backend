import React from 'react';

const AuthFormWrapper = ({ title, children, footerLink }) => {
  return (
    <div className="auth-card">
      <h2>{title}</h2>
      {children}
      <div className="auth-footer">
        {footerLink}
      </div>
    </div>
  );
};

export default AuthFormWrapper;