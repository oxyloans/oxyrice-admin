const userType = localStorage.getItem("userType");

const BASE_URL =
  userType === "live"
    ? "https://meta.oxyloans.com/api"
    : "https://meta.oxyglobal.tech/api";

export default BASE_URL;
