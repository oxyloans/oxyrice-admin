// Config.js
const userType = localStorage.getItem("userType") || "live"; // Default to "live" if not set

const BASE_URL =
  userType === "live"
    ? "https://meta.oxyloans.com/api"
    : "https://meta.oxyglobal.tech/api";
export const uploadurlwithId =
  "https://oxybricksv1.s3.ap-south-1.amazonaws.com/null/";

export default BASE_URL;
