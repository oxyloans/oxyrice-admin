import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ element, loginPath = "/" }) => {
  const isAuthenticated = !!localStorage.getItem("token");
  const location = useLocation();

  if (!isAuthenticated) {
    const sanitizedPath = encodeURI(location.pathname + location.search);
    localStorage.setItem("redirectAfterLogin", sanitizedPath);
    return <Navigate to={loginPath} replace />;
  }

  return element;
};

export default ProtectedRoute;
