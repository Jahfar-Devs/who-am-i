import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { getContent } from "@/lib/store";
import "./globals.css";

// Content comes from D1 on every request, so nothing is prerendered at build time.
export const dynamic = "force-dynamic";

const space = Space_Grotesk({ variable: "--font-space", subsets: ["latin"] });
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const jb = JetBrains_Mono({ variable: "--font-jb", subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const { site } = await getContent();
  return { title: site.title, description: site.description };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const { site } = await getContent();
  return (
    <html
      lang="en"
      className={`${space.variable} ${inter.variable} ${jb.variable}`}
      style={{ "--accent": site.accent } as React.CSSProperties}
    >
      <body>{children}</body>
    </html>
  );
}
