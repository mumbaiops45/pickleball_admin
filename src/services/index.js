/**
 * One import site for the whole service layer.
 *
 * Every module here is a thin, typed-by-convention wrapper over one Express
 * router. Nothing in `services/` touches React — hooks in `hooks/` own the
 * loading and error state, components own the rendering.
 */

export * as addressService from "@/services/address.service";
export * as authService from "@/services/auth.service";
export * as cartService from "@/services/cart.service";
export * as categoryService from "@/services/category.service";
export * as customerService from "@/services/customer.service";
export * as dashboardService from "@/services/dashboard.service";
export * as orderService from "@/services/order.service";
export * as paymentService from "@/services/payment.service";
export * as productService from "@/services/product.service";
export * as reportService from "@/services/report.service";
export * as wishlistService from "@/services/wishlist.service";
