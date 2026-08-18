import AdminShell from "@/components/layout/AdminShell";

/**
 * Route group for every signed-in screen. It exists so /login can render
 * full-bleed without the sidebar while everything else shares one chrome.
 */
export default function AdminLayout({ children }) {
  return <AdminShell>{children}</AdminShell>;
}
