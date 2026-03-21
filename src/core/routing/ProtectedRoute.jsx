import React from "react";
import { Navigate, useLocation } from "react-router-dom";

// Map loginPath → module-specific localStorage key
const loginPathToRedirectKey = {
  "/": "redirectAfterLogin_admin",
  "/admin/agentslogin": "redirectAfterLogin_agents",
  "/admin/companieslogin": "redirectAfterLogin_companies",
  "/admin/taskmanagementlogin": "redirectAfterLogin_task",
};

const ProtectedRoute = ({ element, loginPath = "/" }) => {
  const isAuthenticated = !!localStorage.getItem("adminAccessToken");
  const location = useLocation();

  if (!isAuthenticated) {
    const sanitizedPath = encodeURI(location.pathname + location.search);
    const redirectKey = loginPathToRedirectKey[loginPath] || "redirectAfterLogin_admin";
    localStorage.setItem(redirectKey, sanitizedPath);
    return <Navigate to={loginPath} replace />;
  }

  return element;
};

export default ProtectedRoute;
