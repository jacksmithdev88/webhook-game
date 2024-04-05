// PublicRoute.js
import { useContext } from 'react';
import { UserContext } from '../context/UserContext.js';
import { Navigate } from 'react-router-dom';

const PublicRoute = ({ children }) => {
  const { user } = useContext(UserContext);
  return user && user.token ? <Navigate to="/home" /> : children;
};

export default PublicRoute;