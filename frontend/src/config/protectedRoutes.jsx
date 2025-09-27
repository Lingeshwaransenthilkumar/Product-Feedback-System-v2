import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  // JWT token 
  const token = localStorage.getItem("token"); 
  if (!token) {
    // if no token, redirect to login
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
