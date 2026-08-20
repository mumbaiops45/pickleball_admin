import { Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/store/AuthProvider";


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

  viewportFit: "cover",

  interactiveWidget: "resizes-content",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistMono.variable} h-full antialiased`}
    >
     
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />

      <body className="min-h-full" suppressHydrationWarning>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
