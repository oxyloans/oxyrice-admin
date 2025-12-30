import React from "react";

const LoadingSpinner = () => (
  <div
    style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#f9fafb",
      fontFamily: "system-ui, sans-serif",
    }}
  >
    <div
      style={{
        width: "50px",
        height: "50px",
        border: "5px solid #f3f3f3",
        borderTop: "5px solid #8b5cf6",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
        marginBottom: "20px",
      }}
    />
    <p style={{ color: "#4c1d95", fontSize: "18px" }}>Loading...</p>
  </div>
);

// Inject spinner keyframes once
if (typeof document !== "undefined") {
  const styleId = "global-spinner-keyframes";
  if (!document.getElementById(styleId)) {
    const styleTag = document.createElement("style");
    styleTag.id = styleId;
    styleTag.innerHTML = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(styleTag);
  }
}

export default LoadingSpinner;


