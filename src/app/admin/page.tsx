import type { Metadata } from "next";
import AdminApp from "@/components/admin/AdminApp";

export const metadata: Metadata = {
  title: "Admin — Portfolio",
  robots: { index: false, follow: false },
};

// The shell is static; every piece of data behind it is served by the
// /api/admin routes, which require the signed session cookie.
export default function AdminPage() {
  return <AdminApp />;
}
