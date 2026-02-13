import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

const siteUrl = "https://marckennethlomio.com";

export const metadata: Metadata = {
  title: "Marc Kenneth Lomio | Software Engineer Portfolio",
  description:
    "Software Engineer with 6+ years of experience in C#, .NET, Angular, SQL Server, and Azure. Delivered 12+ projects across HR, insurance, e-commerce, healthcare, and more.",
  keywords: [
    "Marc Kenneth Lomio",
    "Software Engineer",
    "Full-Stack Developer",
    ".NET Developer",
    "Angular Developer",
    "C# Developer",
    "Azure",
    "SQL Server",
    "Portfolio",
  ],
  authors: [{ name: "Marc Kenneth Lomio" }],
  creator: "Marc Kenneth Lomio",
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Marc Kenneth Lomio | Portfolio",
    title: "Marc Kenneth Lomio | Software Engineer",
    description:
      "Software Engineer with 6+ years in the Microsoft tech stack. Explore my projects, skills, and experience.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Marc Kenneth Lomio - Software Engineer Portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Marc Kenneth Lomio | Software Engineer",
    description:
      "Software Engineer with 6+ years in the Microsoft tech stack. Explore my projects, skills, and experience.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/pawn.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="canonical" href={siteUrl} />
      </head>
      <body>
        {children}
        <Script
          src={`https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`}
          strategy="afterInteractive"
        />
        <Script
          type="module"
          src="https://unpkg.com/ionicons@5.5.2/dist/ionicons/ionicons.esm.js"
          strategy="afterInteractive"
        />
        <Script
          noModule
          src="https://unpkg.com/ionicons@5.5.2/dist/ionicons/ionicons.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}