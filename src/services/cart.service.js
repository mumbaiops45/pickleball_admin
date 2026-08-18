import { api, unwrap } from "@/lib/api";

/**
 * /api/cart — scoped to `req.user`. Present so the panel can build and inspect
 * a test order end to end; there is no route that reads a customer's cart.
 */

export async function getCart(options) {
  return unwrap(await api.get("/cart", options));
}

export async function addToCart({ productId, quantity = 1 }) {
  return unwrap(await api.post("/cart", { productId, quantity }));
}

export async function updateCartItem({ productId, quantity }) {
  return unwrap(await api.put("/cart", { productId, quantity }));
}

export async function removeCartItem(productId) {
  return unwrap(await api.delete(`/cart/${productId}`));
}

export async function clearCart() {
  return unwrap(await api.delete("/cart"));
}
