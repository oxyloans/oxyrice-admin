const { createProxyMiddleware } = require("http-proxy-middleware");

/**
 * Dev proxy for AI Campaign Offers.
 * Default: localhost (same machine as npm start).
 * Override: set CART_SERVICE_PROXY / PRODUCT_SERVICE_PROXY before npm start.
 *
 * Example (LAN backend):
 *   set CART_SERVICE_PROXY=http://192.168.0.135:9028
 *   set PRODUCT_SERVICE_PROXY=http://192.168.0.135:9027
 */
const CART_TARGET =
   "https://meta.oxyloans.com" || "http://localhost:9028";
const PRODUCT_TARGET =
  "https://meta.oxyloans.com" || "http://localhost:9027";

const PROXY_OPTS = {
  changeOrigin: true,
  pathRewrite: { "^/local-api": "" },
  logLevel: "warn",
  proxyTimeout: 120000,
  timeout: 120000,
};

module.exports = function (app) {
  console.warn(
    `[setupProxy] cart-service -> ${CART_TARGET}, product-service -> ${PRODUCT_TARGET}`,
  );

  app.use(
    "/local-api/api/cart-service",
    createProxyMiddleware({
      target: CART_TARGET,
      ...PROXY_OPTS,
    }),
  );

  app.use(
    "/local-api/api/product-service",
    createProxyMiddleware({
      target: PRODUCT_TARGET,
      ...PROXY_OPTS,
    }),
  );
};
