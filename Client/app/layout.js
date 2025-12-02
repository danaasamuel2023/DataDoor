import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/compoenent/nav";
import Footer from "@/compoenent/footer";
import AuthGuard from "@/component/AuthGuide";
import WhatsAppLink from "@/component/groupIcon";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "DataDoor | Ghana's Premier Data Marketplace",
  description: "Your gateway to seamless data services in Ghana. Buy and manage mobile data plans for MTN, AirtelTigo, and Telecel with ease.",
  keywords: "data marketplace, Ghana, mobile data, MTN data, AirtelTigo data, Telecel data, buy data Ghana, data reseller",
  verification: {
    google: "Ef-n9jMB8qrIion-ddD_qPQpqd1syAOgKmuvhaBu_2o",
  },
  openGraph: {
    title: "DataDoor | Ghana's Premier Data Marketplace",
    description: "Your gateway to seamless data services in Ghana. Buy and manage mobile data plans with ease.",
    url: "https://www.datanestgh.com",
    siteName: "DataDoor",
    images: [
      {
        url: "/component/datamart-logo.svg",
        width: 1200,
        height: 630,
        alt: "DataDoor - Ghana's Data Marketplace",
      },
    ],
    locale: "en_GH",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DataDoor | Ghana's Premier Data Marketplace",
    description: "Your gateway to seamless data services in Ghana. Buy and manage mobile data plans with ease.",
    images: ["/images/datamart-twitter.jpg"],
  },
  alternates: {
    canonical: "https://www.datanestgh.shop/",
  },
  robots: {
    index: true,
    follow: true,
  },
  metadataBase: new URL("https://www.datanestgh.shop"),
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
       
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <Navbar />
        <main className="flex-grow">
          {children}
          <WhatsAppLink/>
        </main>
        <Footer />
      </body>
    </html>
  );
}