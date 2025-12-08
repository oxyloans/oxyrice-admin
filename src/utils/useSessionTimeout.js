// src/utils/useSessionTimeout.js
import { useEffect } from "react";

export function useSessionTimeout() {
  useEffect(() => {
    const TIMEOUT = 1 * 60 * 1000; // 1 minute
    let timer = null;

    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(logout, TIMEOUT);
    };

    const logout = () => {
      const entryPoint = localStorage.getItem("entryPoint") || "/";
      localStorage.clear();
      sessionStorage.clear();

      const redirectTo =
        {
          "/": "/",
          "/admin/agentslogin": "/admin/agentslogin",
          "/admin/comapanieslogin": "/admin/comapanieslogin",
          "/admin/taskmanagementlogin": "/admin/taskmanagementlogin",
        }[entryPoint] || "/";

      window.location.replace(redirectTo);
    };

    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];
    events.forEach((e) => document.addEventListener(e, resetTimer, true));

    resetTimer(); // Start timer on mount

    return () => {
      clearTimeout(timer);
      events.forEach((e) => document.removeEventListener(e, resetTimer, true));
    };
  }, []);
}
