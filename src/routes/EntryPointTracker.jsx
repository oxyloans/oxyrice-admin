import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const validEntryPoints = [
  "/",
  "/admin/agentslogin",
  "/admin/comapanieslogin",
  "/admin/taskmanagementlogin",
];

function EntryPointTracker() {
  const location = useLocation();

  useEffect(() => {
    if (validEntryPoints.includes(location.pathname)) {
      localStorage.setItem("entryPoint", location.pathname);
    }
  }, [location.pathname]);

  return null;
}

export default EntryPointTracker;


