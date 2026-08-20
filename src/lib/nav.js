import {
  CategoriesIcon,
  CustomersIcon,
  DashboardIcon,
  OrdersIcon,
  PaymentsIcon,
  ProductsIcon,
  ReportsIcon,
  SettingsIcon,
} from "@/components/ui/Icons";


export const NAV_SECTIONS = [
  {
    label: "Overview",
    items: [
      {
        href: "/dashboard",
        label: "Dashboard",
        icon: DashboardIcon,
        description: "Revenue, orders and stock at a glance",
      },
      {
        href: "/reports",
        label: "Reports",
        icon: ReportsIcon,
        description: "Sales, inventory and payment registers",
      },
    ],
  },
  {
    label: "Catalogue",
    items: [
      {
        href: "/products",
        label: "Products",
        icon: ProductsIcon,
        description: "Paddles, balls, apparel and gear",
      },
      {
        href: "/categories",
        label: "Categories",
        icon: CategoriesIcon,
        description: "How the storefront is grouped",
      },
    ],
  },
  {
    label: "Commerce",
    items: [
      {
        href: "/orders",
        label: "Orders",
        icon: OrdersIcon,
        description: "Order register",
      },
      {
        href: "/payments",
        label: "Payments",
        icon: PaymentsIcon,
        description: "Transaction ledger",
      },
      {
        href: "/customers",
        label: "Customers",
        icon: CustomersIcon,
        description: "Accounts and access",
      },
    ],
  },
  {
    label: "Panel",
    items: [
      {
        href: "/settings",
        label: "Settings",
        icon: SettingsIcon,
        description: "Session and API connection",
      },
    ],
  },
];

export const NAV_ITEMS = NAV_SECTIONS.flatMap((section) => section.items);

export function findNavItem(pathname) {
  return NAV_ITEMS.filter(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  ).sort((a, b) => b.href.length - a.href.length)[0];
}
