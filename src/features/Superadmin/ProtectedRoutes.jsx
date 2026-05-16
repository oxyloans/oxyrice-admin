import { Navigate } from "react-router-dom";
import { getToken } from "./auth";

export default function ProtectedRoutes({ element, loginPath = "/superadmin/login" }) {
  return getToken() ? element : <Navigate to={loginPath} replace />;
}
