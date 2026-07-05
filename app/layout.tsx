import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { StoreProvider } from "@/components/store-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "ClassBoard Games — Classroom games, beautifully organised",
    template: "%s — ClassBoard Games",
  },
  description:
    "Publish, organise, discover and play teacher-made classroom games.",
  metadataBase: new URL("https://classboardgames.com"),
  openGraph: {
    title: "ClassBoard Games",
    description:
      "A searchable, teacher-led home for classroom games.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <StoreProvider>
          <a className="skip-link" href="#main-content">
            Skip to content
          </a>
          <SiteHeader />
          <main id="main-content">{children}</main>
          <SiteFooter />
        </StoreProvider>
      </body>
    </html>
  );
}
