import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';

import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import Home from './features/main/Home';
import Login from './features/auth/Login';
import ProductList from './features/items/ProductList';
import Cart from './features/cart/Cart';
import ProductDetail from './features/items/ProductDetail';
import Checkout from './features/checkout/Checkout';
import Orders from './features/dashboard/Orders';
import Signup from './features/auth/Signup';
import Profile from './features/dashboard/Profile';
import ProtectedRoute from './features/auth/ProtectedRoute'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      // Public Routes
      { path: '/', element: <Home /> },
      { path: '/auth/login', element: <Login /> },
      { path: '/auth/signup', element: <Signup /> },
      { path: '/items', element: <ProductList /> },
      { path: '/items/:id', element: <ProductDetail /> },
      
      // Protected Routes Group
      {
        element: <ProtectedRoute />,
        children: [
          { path: '/cart', element: <Cart /> },
          { path: '/checkout', element: <Checkout /> },
          { path: '/dashboard/profile', element: <Profile /> },
          { path: '/dashboard/orders', element: <Orders /> },
        ],
      },
    ],
  },
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router}/>
    </AuthProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
