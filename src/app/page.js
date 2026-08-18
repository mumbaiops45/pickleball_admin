import { redirect } from "next/navigation";

/**
 * `/` is not a screen. Where a visitor should land depends on a token the
 * server cannot see, so it hands off to /dashboard and <AdminShell> sends
 * them to /login if there is no session.
 */
export default function RootPage() {
  redirect("/dashboard");
}
