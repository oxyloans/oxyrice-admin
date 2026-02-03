// Config.js
const userType = localStorage.getItem("userType") || "live"; // Default to "live" if not set

const BASE_URL =
  userType === "live"
    ? "https://meta.oxyloans.com/api"
    : "https://meta.oxyglobal.tech/api";

export default BASE_URL;
