import { Navigate, Outlet, useLocation } from 'react-router-dom';

const ProtectedRoute = () => {

  // If you check the user's identity with the backend asyncronously, you can use a state for Loading...
  const location = useLocation();

  const isAuthenticated = localStorage.getItem("access");

  return isAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate to="/auth/login" state={{ from: location }} replace />
  );
};

export default ProtectedRoute;