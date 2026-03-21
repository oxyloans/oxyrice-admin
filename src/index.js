// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import './index.css';
// import App from './App';
// import reportWebVitals from './reportWebVitals';

// const root = ReactDOM.createRoot(document.getElementById('root'));
// root.render(
//   <App />
 
// );


// reportWebVitals();
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

if (window.location.protocol === "https:") {
  /* ---------------- BLOCK RIGHT CLICK ---------------- */

  document.addEventListener("contextmenu", (e) => {
    e.preventDefault();
  });

  /* ---------------- BLOCK KEYBOARD SHORTCUTS ---------------- */

  document.onkeydown = function (e) {
    if (e.keyCode === 123) {
      return false;
    }

    if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
      return false;
    }

    if (e.ctrlKey && e.shiftKey && e.keyCode === 74) {
      return false;
    }

    if (e.ctrlKey && e.shiftKey && e.keyCode === 67) {
      return false;
    }

    if (e.ctrlKey && e.keyCode === 85) {
      return false;
    }
  };

  /* ---------------- DEVTOOLS DETECTION ---------------- */

  setInterval(function () {
    if (
      window.outerWidth - window.innerWidth > 160 ||
      window.outerHeight - window.innerHeight > 160
    ) {
      document.body.innerHTML = `
  <div class="devtools-warning">
      Developer Tools are not allowed
  </div>
`;
    }
  }, 1000);
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

reportWebVitals();
