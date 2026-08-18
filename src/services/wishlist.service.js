import { api, unwrap } from "@/lib/api";

/**
 * /api/wishlist — scoped to `req.user`. There is no aggregate "most wishlisted
 * product" route, which is the one an admin would actually want.
 */

export async function getWishlist(options) {
  return unwrap(await api.get("/wishlist", options), []);
}

export async function addToWishlist(productId) {
  return unwrap(await api.post("/wishlist/add", { productId }));
}

export async function removeFromWishlist(productId) {
  return api.delete(`/wishlist/${productId}`);
}

export async function toggleWishlist(productId) {
  return unwrap(await api.post("/wishlist/toggle", { productId }));
}
