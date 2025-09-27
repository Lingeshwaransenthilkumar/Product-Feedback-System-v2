import React from "react";
import { Navigate } from "react-router-dom";
import { getSecureItem } from "../utils/secureStorage";

const ProtectedRoute = ({ children }) => {
  // JWT token 
  const token = getSecureItem("token");  
  if (!token) {
    // if no token, redirect to login
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;

