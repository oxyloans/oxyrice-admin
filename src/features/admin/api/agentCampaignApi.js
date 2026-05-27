import axios from "axios";
import BASE_URL, { uploadurlwithId } from "../../../core/config/Config";

/** Live meta API (product catalog + image paths from production DB) */
const LIVE_PRODUCT_BASE = `${BASE_URL}/product-service`;

/**
 * AI Campaign cart APIs exist only on locally running cart-management-service (9028).
 * Local gateway (localhost:8080) does NOT expose /agent/campaign/* on cart — use /local-api → port 9028.
 *
 * Default: CRA proxy /local-api → localhost:9028 (setupProxy.js).
 * Override: REACT_APP_CART_AGENT_BASE=http://localhost:9028/api/cart-service/agent
 */
const CART_TIMEOUT_MS = 90_000;

const cartApi = axios.create({ timeout: CART_TIMEOUT_MS });
const localApi = axios.create({ timeout: CART_TIMEOUT_MS });

/** Product image catalog — live BASE_URL is fine (product-service is deployed on meta). */
const productApi = axios.create();

const attachAuth = (config) => {
  const token = localStorage.getItem("adminAccessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

cartApi.interceptors.request.use(attachAuth);
localApi.interceptors.request.use(attachAuth);
productApi.interceptors.request.use(attachAuth);

const LOCAL_CART_AGENT_BASE = "/local-api/api/cart-service/agent";
const CART_AGENT_BASE = "https://meta.oxyloans.com/api/cart-service/agent" || LOCAL_CART_AGENT_BASE;
  // process.env.REACT_APP_CART_AGENT_BASE?.replace(/\/$/, "") ||
  // LOCAL_CART_AGENT_BASE;
const LOCAL_PRODUCT_BASE = "/local-api/api/product-service";

function cartUrl(path) {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${CART_AGENT_BASE}${p}`;
}

/** User-facing message when cart proxy or service is down. */
export function formatCartApiError(err) {
  const status = err?.response?.status;
  const requestUrl = err?.config?.url || "";

  if (
    status === 404 &&
    (requestUrl.includes("localhost:8080") ||
      requestUrl.includes("meta.oxyloans.com") ||
      requestUrl.includes("/cart-service/agent"))
  ) {
    return (
      "AI Campaign APIs are not on the gateway (404). "
    );
  }
  if (status === 504 || status === 502 || status === 503) {
    return (
      "Cart service timed out. Start cart-management-service on port 9028 "
    );
  }
  if (!err?.response) {
    return (
      "Cannot reach local cart-service (port 9028). Start cart-management-service, "
    );
  }
  return (
    err.response?.data?.message ||
    err.response?.data?.error ||
    err.message ||
    "Cart request failed"
  );
}

async function cartRequest(config) {
  const res = await cartApi.request(config);
  return res.data;
}

const S3_BASE = "https://oxybricksv1.s3.ap-south-1.amazonaws.com/";

/** Normalize item logo paths from DB into a loadable image URL */
export function resolveItemImageUrl(itemImage) {
  if (itemImage == null) return null;
  const raw = String(itemImage).trim();
  if (!raw || raw === "null" || raw === "undefined") return null;
  if (/^https?:\/\//i.test(raw)) return raw;
  if (raw.startsWith("null/")) {
    return `${S3_BASE}${raw.slice(5)}`;
  }
  if (raw.includes("amazonaws.com")) {
    return raw.startsWith("http") ? raw : `https://${raw.replace(/^\/+/, "")}`;
  }
  if (uploadurlwithId && !raw.includes("/")) {
    return `${uploadurlwithId}${raw}`;
  }
  return `${S3_BASE}${raw.replace(/^\/+/, "")}`;
}

export const SEGMENT_OPTIONS = [
  {
    value: "FREQUENT_BUYER",
    label: "Frequent buyer",
    description: "Customers who order regularly",
  },
  {
    value: "REGISTERED_NO_ORDER",
    label: "Registered, no order yet",
    description: "Signed up but never ordered",
  },
  {
    value: "CHURNED",
    label: "Previously ordered, inactive",
    description: "Win-back cohort",
  },
  {
    value: "CART_ABANDONED",
    label: "Cart abandoned",
    description: "Active cart, no checkout",
  },
];

export async function fetchSegmentPreview(segment) {
  return cartRequest({
    method: "get",
    url: cartUrl("/campaign/bulk-preview"),
    params: { segment },
  });
}

export async function bulkGenerateCampaign(segment, maxOffers = 8) {
  return cartRequest({
    method: "post",
    url: cartUrl("/campaign/bulk-generate"),
    data: null,
    params: { segment, maxOffers },
  });
}

/** @param {string} segment
 *  @param {"asc"|"desc"} [sort="desc"] created date order */
export async function fetchPendingOffers(segment, sort = "desc",status) {
  return cartRequest({
    method: "get",
    url: cartUrl("/campaign/offers/pending"),
    params: { segment, sort, status },
  });
}

export async function approveOffers(segment, offerIds) {
  return cartRequest({
    method: "post",
    url: cartUrl("/campaign/approve"),
    data: offerIds?.length ? { offerIds } : null,
    params: { segment },
  });
}

export async function rejectOffers(segment, offerIds) {
  return cartRequest({
    method: "post",
    url: cartUrl("/campaign/offers/reject"),
    data: { offerIds },
    params: { segment },
  });
}

export async function fetchEligibleUserIds(segment) {
  return cartRequest({
    method: "get",
    url: cartUrl("/campaign/eligible-users"),
    params: { segment },
  });
}

/** Manager dynamic add-on merged into the static Groq system prompt (special days). */
export async function fetchPromptSupplement() {
  return cartRequest({
    method: "get",
    url: cartUrl("/campaign/prompt-supplement"),
  });
}

export async function savePromptSupplement(supplementText) {
  return cartRequest({
    method: "put",
    url: cartUrl("/campaign/prompt-supplement"),
    data: { supplementText: supplementText ?? "" },
  });
}

function putImage(map, itemId, url) {
  if (!itemId || !url) return;
  const s = String(itemId);
  map.set(s.toLowerCase(), url);
  map.set(s.replace(/-/g, "").toLowerCase(), url);
}

export function lookupImage(map, itemId) {
  if (!itemId || !map) return null;
  const s = String(itemId);
  return (
    map.get(s.toLowerCase()) ||
    map.get(s.replace(/-/g, "").toLowerCase()) ||
    null
  );
}

function indexCatalogItem(map, item) {
  if (!item?.itemId) return;
  const url = resolveItemImageUrl(
    item.itemImage || item.itemLogo || item.image,
  );
  if (url) {
    putImage(map, item.itemId, url);
  }
}

function mergeCatalogPayloadIntoMap(data, map) {
  if (!data) return;

  if (Array.isArray(data)) {
    data.forEach((entry) => {
      if (entry?.itemsResponseDtoList || entry?.items) {
        const items = entry.itemsResponseDtoList || entry.items || [];
        items.forEach((item) => indexCatalogItem(map, item));
      } else {
        indexCatalogItem(map, entry);
      }
    });
    return;
  }

  if (typeof data === "object") {
    const items = data.itemsResponseDtoList || data.items || [];
    items.forEach((item) => indexCatalogItem(map, item));
    if (data.subCategories) mergeCatalogPayloadIntoMap(data.subCategories, map);
  }
}

function mergeImageMaps(base, extra) {
  const out = new Map(base);
  if (extra) {
    extra.forEach((url, key) => {
      if (url) out.set(key, url);
    });
  }
  return out;
}

/** Use imageUrl stored on offer components (survives refresh / pagination) */
export function seedImageMapFromOffers(offers, map = new Map()) {
  (offers || []).forEach((offer) => {
    (offer.components || []).forEach((c) => {
      if (!c?.itemId) return;
      const url = resolveItemImageUrl(c.imageUrl || c.itemImage || c.itemLogo);
      if (url) putImage(map, c.itemId, url);
    });
  });
  return map;
}

async function fetchCatalogSlice(path) {
  try {
    const { data } = await productApi.get(`${LIVE_PRODUCT_BASE}${path}`);
    if (data) return data;
  } catch {
    /* try local fallback */
  }
  try {
    const { data } = await localApi.get(`${LOCAL_PRODUCT_BASE}${path}`);
    return data;
  } catch {
    return null;
  }
}

async function getProduct(path, params) {
  try {
    const { data } = await productApi.get(`${LIVE_PRODUCT_BASE}${path}`, { params });
    return data;
  } catch {
    try {
      const { data } = await localApi.get(`${LOCAL_PRODUCT_BASE}${path}`, { params });
      return data;
    } catch {
      return null;
    }
  }
}

/** Per-item logo from product DB */
async function fetchItemImageById(itemId) {
  const data = await getProduct(`/getItemId/${itemId}`);
  if (!data) return null;
  return resolveItemImageUrl(data?.image || data?.itemImage || data?.itemLogo);
}

/** Price-tag / shelf images when item logo is empty */
async function fetchPriceImageByItemId(itemId) {
  try {
    const data = await getProduct("/imagePriceBasedOnItemId", { itemId });
    const list = data?.list;
    if (!Array.isArray(list)) return null;
    for (const entry of list) {
      const url = resolveItemImageUrl(entry?.images);
      if (url) return url;
    }
  } catch {
    /* ignore */
  }
  return null;
}

async function resolveItemImageWithFallbacks(itemId) {
  const fromItem = await fetchItemImageById(itemId);
  if (fromItem) return fromItem;
  return fetchPriceImageByItemId(itemId);
}

/**
 * Build itemId -> image URL map from several product-service catalogs:
 * getItemsData, getItemsDataForAskOxy, showItemsForCustomrs (active seller items).
 */
export async function fetchProductImageMap() {
  const map = new Map();
  const payloads = await Promise.all([
    fetchCatalogSlice("/getItemsData"),
    fetchCatalogSlice("/getItemsDataForAskOxy"),
    fetchCatalogSlice("/showItemsForCustomrs"),
  ]);
  payloads.forEach((data) => mergeCatalogPayloadIntoMap(data, map));
  return map;
}

/** Fill missing thumbnails via stored URLs, then getItemId / imagePriceBasedOnItemId */
export async function enrichImageMapForOffers(catalogMap, offers) {
  const map = new Map(catalogMap);
  seedImageMapFromOffers(offers, map);

  const itemIds = new Set();
  (offers || []).forEach((offer) => {
    (offer.components || []).forEach((c) => {
      if (c?.itemId) itemIds.add(String(c.itemId));
    });
  });

  const missing = [...itemIds].filter((id) => !lookupImage(map, id));
  const BATCH = 8;
  for (let i = 0; i < missing.length; i += BATCH) {
    const slice = missing.slice(i, i + BATCH);
    await Promise.all(
      slice.map(async (id) => {
        const url = await resolveItemImageWithFallbacks(id);
        if (url) putImage(map, id, url);
      }),
    );
  }
  return map;
}

export { mergeImageMaps };
