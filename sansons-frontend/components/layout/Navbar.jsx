"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, Search, Heart, ShoppingBag, User } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import MegaMenu from "./MegaMenu";
import MobileDrawer from "./MobileDrawer";
import PredictiveSearch from "./PredictiveSearch";
import { useCart } from "@/lib/context/CartContext";
import { useWishlist } from "@/lib/context/WishlistContext";
import { getNavigationMenu } from "@/lib/services/cmsService";

export default function Navbar() {
  const [navigation, setNavigation] = useState([]);
  const [scrolled, setScrolled] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const { itemCount, openDrawer } = useCart();
  const { count: wishlistCount } = useWishlist();

  useEffect(() => {
    getNavigationMenu().then(setNavigation);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const activeItem = navigation.find((n) => n.id === openMenuId);

  return (
    <header
      className={`sticky top-0 z-40 bg-canvas/95 backdrop-blur-sm transition-shadow ${
        scrolled ? "shadow-soft" : ""
      }`}
      onMouseLeave={() => setOpenMenuId(null)}
    >
      <div className="max-w-7xl mx-auto px-4 lg:px-6 h-20 flex items-center justify-between relative">
        <div className="flex items-center gap-4 lg:hidden">
          <button onClick={() => setMobileOpen(true)} aria-label="Open menu" className="p-1">
            <Menu size={22} />
          </button>
        </div>

        {/* Dynamic logo — swap the text below for an <Image> once branding assets exist */}
        <Link href="/" className="font-display text-2xl lg:text-3xl tracking-tight select-none">
          Sansons
        </Link>

        <nav className="hidden lg:flex items-center gap-8 ml-10">

          {navigation.map((item) => (
            <div key={item.id} className="relative" onMouseEnter={() => item.megaMenu && setOpenMenuId(item.id)}>
              <Link
                href={item.href}
                className="text-sm tracking-wide uppercase py-8 inline-block hover:text-forest transition-colors"
              >
                {item.label}
              </Link>
            </div>
          ))}
        </nav>

        <div className="flex items-center gap-4 lg:gap-5">
          <button onClick={() => setSearchOpen(true)} aria-label="Search" className="p-1 hover:text-forest">
            <Search size={20} />
          </button>
          <Link href="/wishlist" aria-label="Wishlist" className="relative p-1 hover:text-forest hidden sm:inline-flex">
            <Heart size={20} />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-forest text-canvas text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </Link>
          <Link href="/account" aria-label="Account" className="p-1 hover:text-forest hidden sm:inline-flex">
            <User size={20} />
          </Link>
          <button onClick={openDrawer} aria-label="Open cart" className="relative p-1 hover:text-forest">
            <ShoppingBag size={20} />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-forest text-canvas text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </button>
        </div>

        <AnimatePresence>{activeItem && <MegaMenu item={activeItem} onClose={() => setOpenMenuId(null)} />}</AnimatePresence>
      </div>

      <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} navigation={navigation} />
      <PredictiveSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}
