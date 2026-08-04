import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Navbar from "@/components/layout/Navbar";
import CartDrawer from "@/components/layout/CartDrawer";
import Footer from "@/components/layout/Footer";
import { getAnnouncementBar } from "@/lib/services/cmsService";

export default async function StorefrontLayout({ children }) {
  const announcement = await getAnnouncementBar();

  return (
    <>
      <AnnouncementBar content={announcement} />
      <Navbar />
      <main className="min-h-[60vh]">{children}</main>
      <Footer />
      <CartDrawer />
    </>
  );
}
