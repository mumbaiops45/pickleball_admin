# API review — Pickleball Ecommerce backend

Audit of every route the Express API exposes, from the point of view of an
admin panel. Source read: `pickleball_ecommerce_backend/pickleball-ecommerce`
(`src/app.js`, all 8 routers, controllers, services, models, middleware).

Nothing in the backend was modified. Each item below has the patch that would
close it.

**Updated after the Render deploy** (`https://pickleball-backend-mwc3.onrender.com`).
Items marked ✅ have since been fixed on the backend.

---

## 1. Blockers

### 1.1 CORS only allows the storefront origin — ✅ fixed

`app.js` now allows `http://localhost:3000` alongside 3000, and the deployed
service answers the preflight with `access-control-allow-origin: http://localhost:3000`.

Worth noting for later: the list is hardcoded to localhost. When the panel is
deployed somewhere, its origin has to be added — ideally from an env var so
Render can set it without a code change.

### 1.2 The base URL must include `/api`

Every router is mounted under `/api` (`app.use("/api/auth", authRoutes)`), so
`NEXT_PUBLIC_API_URL` has to end in `/api`. Pointing it at the bare host sends
the login call to `/auth/login`, which 404s.

```
NEXT_PUBLIC_API_URL=https://pickleball-backend-mwc3.onrender.com/api
```

`NEXT_PUBLIC_*` is inlined at build time — **restart `npm run dev` after
changing it**, a hot reload will not pick it up.

### 1.3 There is no ADMIN account, and no way to create one

`register` hardcodes `role: "CUSTOMER"`, so the only way to get an admin is
directly in the database:

```js
// mongosh, against the ecommerce database
// hash first:  node -e "console.log(require('bcryptjs').hashSync('yourpassword', 10))"
db.users.insertOne({
  name: "Store admin",
  email: "admin@paddlehaus.in",
  password: "<the bcrypt hash>",
  role: "ADMIN",
  isBlocked: false,
  lastLoginAt: null,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

Promoting an existing account works too:

```js
db.users.updateOne({ email: "you@example.com" }, { $set: { role: "ADMIN" } })
```

---

## 2. Security — open write routes

### 2.1 Products and categories accept writes from anyone

`product.routes.js` and `category.routes.js` never call `authMiddleware`.
`POST /api/products`, `PUT /api/products/:id` and `DELETE /api/products/:id`
— and the same three on categories — are reachable by any client on the
network with no token at all.

```js
// src/routes/product.routes.js
import authMiddleware from "../middlewares/auth.middleware.js";
import adminMiddleware from "../middlewares/admin.middleware.js";

router.get("/", getAllProducts);            // public: the storefront reads these
router.get("/:id", getProductById);

router.post("/", authMiddleware, adminMiddleware, createProduct);
router.put("/:id", authMiddleware, adminMiddleware, updateProduct);
router.delete("/:id", authMiddleware, adminMiddleware, deleteProduct);
```

### 2.2 No role check anywhere — ✅ partly fixed

`src/middlewares/admin.middleware.js` now exists and guards the new
`/api/auth/users` routes. It is **not yet applied** to the product and category
writers in §2.1 — that is the remaining gap.

### 2.3 `/api/auth/login` signs a token for customers too

There is no admin login route, so the panel checks `user.role === "ADMIN"` in
`store/AuthProvider.js` and refuses to store a customer session. **That is a UI
gate, not a security boundary** — a customer's token is still a valid token
against every route above. §2.1 and §2.2 are what actually close it.

### 2.4 The OTP is hardcoded

`sendOtp` logs `"123456"` and `verifyOtp` compares against the same literal.
Fine as a stub; it must not reach production, and `verifyOtp` currently issues
no token, so the OTP flow proves nothing to the caller.

---

## 3. Correctness

### 3.1 No error-handling middleware

Every controller ends with `next(error)`, but `app.js` registers no
`(err, req, res, next)` handler. Express falls through to its default, which
answers with an **HTML stack trace and a 500** — so "Product not found"
arrives as a 500 full of markup instead of a 404 with a message. The panel
detects the non-JSON body and substitutes a generic message, but the status
codes stay wrong.

```js
// src/app.js — after the routes
app.use((req, res) => {
    res.status(404).json({ success: false, message: "Route not found" });
});

app.use((error, req, res, next) => {
    console.error(error);

    const status = error.status || (/not found/i.test(error.message) ? 404 : 400);

    res.status(status).json({
        success: false,
        message: error.message || "Something went wrong"
    });
});
```

### 3.2 `dotenv.config()` runs after the app is imported

```js
// server.js
import app from "./src/app.js";   // this evaluates app.js first
dotenv.config();                  // …and only then loads .env
```

ES module imports are hoisted and evaluated before any statement in the file.
Nothing in `app.js` reads `process.env` at module scope today, so it works by
luck. Add one and it breaks. Move the load into its own first import
(`import "./src/config/env.js"`) or call `dotenv.config()` in `app.js` above
the other imports.

### 3.3 `cookie-parser` and `credentials: true` are unused

The token is returned in the response body and read from the `Authorization`
header. No cookie is ever set or read. Either drop the cookie machinery, or
move to an httpOnly refresh cookie — the current mix suggests a protection
that is not there.

### 3.4 No validation layer

Controllers pass `req.body` to services untouched. `createProduct` will accept
`price: -5` past the schema `min` only as a 500, and unknown fields are
silently dropped by Mongoose. A `zod`/`joi` schema per route would turn those
into 400s with a usable message.

---

## 4. Missing endpoints — the panel is wired for these

Each one is already declared in `src/services/` and rejects with a `501`, which
the panel renders as an explanatory panel naming the route. Add the route, drop
the stub, and the screen lights up with no other change.

| Screen | Needs | Notes |
| --- | --- | --- |
| Orders | `GET /api/orders/admin` | Every current order route filters by `req.user`, so an admin sees only their own orders. Populate `user` and sort by `createdAt: -1`. |
| Orders | `PATCH /api/orders/:id/status` | Move an order through `PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED`. The enum already exists on the model. |
| Orders | `PATCH /api/orders/:id/payment-status` | Mark a COD order `PAID` on delivery. |
| ~~Customers~~ | ✅ `GET/PUT/DELETE /api/auth/users[/:id]` | Shipped, admin-guarded. The panel's Customers screen is live against it: list, search, block/unblock, role change, delete. |
| Payments | `GET /api/payments/admin` | Populate `order` and `user`. |
| Payments | `POST /api/payments/:id/refund` | Set `REFUNDED` on both the payment and its order. |
| Dashboard | `GET /api/admin/stats` | Revenue, order count, top products. The dashboard derives what it can from the catalogue and deliberately shows nothing it cannot verify. |
| Auth | `GET /api/auth/me` | Without it the panel cannot revalidate a stored token — the profile shown is the copy saved at login, and expiry is only discovered on the next 401. |

---

## 5. Ergonomics — worth doing, not urgent

- **`GET /api/products` returns everything.** No pagination, no `?search=`, no
  `?category=`, no `?status=`. The panel filters client-side, which is fine for
  a few hundred products and wrong for a few thousand. `?page`, `?limit`,
  `?search` and `?status` on the products service would move that work to Mongo.
- **The storefront cannot ask for published products only.** `getAllProductsService`
  has no filter, so DRAFT and ARCHIVED products are served to shoppers unless the
  frontend remembers to exclude them. A default of `{ status: "PUBLISHED", isActive: true }`
  for unauthenticated callers would be safer.
- **No image upload.** `product.images` and `category.image` are URL strings, so
  the panel asks for a URL. Multer + S3/Cloudinary would let the forms accept files.
- **`deleteProduct` and `deleteCategory` are hard deletes.** The `status: ARCHIVED`
  enum and `isActive` flag exist — a soft delete would keep order history intact.
  Deleting a category also leaves products pointing at a missing reference; the
  service does not check.
- **`GET /api/orders/:id`** rejects another user's order via the service filter,
  which is correct — worth keeping when the admin variant is added, gated by role
  rather than dropped.

---

## 6. What the panel does today

| Route | Method | Used by | State |
| --- | --- | --- | --- |
| `/api/auth/login` | POST | Login screen | ✅ Working (role checked client-side) |
| `/api/auth/register` | POST | `authService.register` | ✅ Wired, creates CUSTOMER only |
| `/api/auth/send-otp`, `/verify-otp` | POST | `authService` | ✅ Wired, stubbed server-side |
| `/api/categories` | GET/POST/PUT/DELETE | Categories screen | ✅ Full CRUD in the UI |
| `/api/products` | GET/DELETE | Products screen | ✅ List, search, filter, delete |
| `/api/products` | POST/PUT | `productService` | ✅ Service + hooks ready, form not built |
| `/api/auth/users` | GET/PUT/DELETE | Customers screen | ✅ List, filter, block, role, delete |
| `/api/orders` | GET/POST/PATCH | `orderService` | ⚠️ Wired but user-scoped |
| `/api/payments` | POST | `paymentService` | ⚠️ Wired but checkout-side |
| `/api/cart`, `/api/wishlist`, `/api/addresses` | all | services | ⚠️ Wired, user-scoped, little admin use |
