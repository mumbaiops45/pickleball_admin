import { Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/store/AuthProvider";

/**
 * Plus Jakarta Sans carries the whole panel: it is a variable face, so the
 * one request covers every weight the UI asks for (400 body, 500/600 labels
 * and headings) without loading a file per weight.
 *
 * Mono stays Geist Mono — it is only ever used for SKUs and order numbers,
 * where an unmistakably monospaced face matters more than matching the
 * heading font.
 */
const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: {
    default: "PADDLEHAUS Admin",
    template: "%s · PADDLEHAUS Admin",
  },
  description:
    "Catalogue, category and order administration for the PADDLEHAUS pickleball store.",
  // An internal tool has no business in search results.
  robots: { index: false, follow: false },
};

export const viewport = {
  themeColor: "#12141a",
  colorScheme: "light",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${jakartaSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      {/* Extensions — Grammarly, password managers — write their own
          attributes onto <body> before React hydrates, which React reports as
          a mismatch it "won't patch up". The suppression is scoped to this one
          element's own attributes, so a genuine mismatch anywhere inside the
          tree is still reported. */}
      <body className="min-h-full" suppressHydrationWarning>
        {/* The session lives above the router so /login and the shell read the
            same store — signing in navigates without a reload. */}
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
