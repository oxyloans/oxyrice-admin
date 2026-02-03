import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ element, loginPath = "/" }) => {
  const isAuthenticated = !!localStorage.getItem("token");
  const location = useLocation();

  if (!isAuthenticated) {
    localStorage.setItem(
      "redirectAfterLogin",
      location.pathname + location.search,
    );
    return <Navigate to={loginPath} replace />;
  }

  return element;
};

export default ProtectedRoute;
