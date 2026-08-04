"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { buttonTap } from "@/lib/motion";

const VARIANTS = {
  primary: "bg-forest text-canvas hover:bg-forestLight",
  dark: "bg-ink text-canvas hover:bg-ink/90",
  outline: "bg-transparent border border-ink text-ink hover:bg-ink hover:text-canvas",
  ghost: "bg-transparent text-ink hover:bg-ink/5",
  subtle: "bg-canvas2 text-ink hover:bg-line",
  danger: "bg-wine text-canvas hover:bg-wine/90",
};

const SIZES = {
  sm: "text-xs px-3.5 py-2",
  md: "text-sm px-5 py-3",
  lg: "text-base px-7 py-4",
};

export default function Button({
  as: Comp = "button",
  variant = "primary",
  size = "md",
  className,
  children,
  disabled,
  ...props
}) {
  return (
    <motion.div
      variants={buttonTap}
      initial="rest"
      whileTap={disabled ? "rest" : "tap"}
      className="inline-block"
    >
      <Comp
        disabled={disabled}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-medium tracking-wide uppercase text-[13px] transition-colors duration-300 rounded-sm disabled:opacity-40 disabled:cursor-not-allowed",
          VARIANTS[variant],
          SIZES[size],
          className
        )}
        {...props}
      >
        {children}
      </Comp>
    </motion.div>
  );
}
