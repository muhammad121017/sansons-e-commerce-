"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, Search, Heart, ShoppingBag, User, LayoutGrid } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import MegaMenu from "./MegaMenu";
import MobileDrawer from "./MobileDrawer";
import CategoryDrawer from "./CategoryDrawer";
import PredictiveSearch from "./PredictiveSearch";
import { useCart } from "@/lib/context/CartContext";
import { useWishlist } from "@/lib/context/WishlistContext";
import { getNavigationMenu } from "@/lib/services/cmsService";

export default function Navbar() {
  const [navigation, setNavigation] = useState([]);
  const [scrolled, setScrolled] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [categoryDrawerOpen, setCategoryDrawerOpen] = useState(false);
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
        {/* Top-Left Category Hamburger Menu Button (All Devices) */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCategoryDrawerOpen(true)}
            aria-label="Open Categories Menu"
            className="flex items-center gap-2 px-3 py-2 rounded border border-line bg-paper hover:border-forest hover:text-forest transition-colors text-xs font-semibold"
            title="Browse Categories & Sub-Categories"
          >
            <Menu size={20} className="text-forest" />
            <span className="hidden sm:inline-block uppercase tracking-wider text-[11px]">Categories</span>
          </button>
        </div>

        {/* Dynamic Logo */}
        <Link href="/" className="font-display text-2xl lg:text-3xl tracking-tight select-none">
          Sansons
        </Link>

        <nav className="hidden lg:flex items-center gap-8 ml-6">
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

      <CategoryDrawer open={categoryDrawerOpen} onClose={() => setCategoryDrawerOpen(false)} />
      <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} navigation={navigation} />
      <PredictiveSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}
