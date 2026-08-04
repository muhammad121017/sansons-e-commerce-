/**
 * Centralized Motion System
 * ---------------------------------------------------------
 * Every animated surface in the app pulls its variants from here.
 * Keeps motion consistent, makes reduced-motion handling trivial,
 * and gives one place to retune timing/easing for the whole site.
 */

export const EASE = [0.16, 1, 0.3, 1]; // premium "ease-out-expo"-ish curve

export const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.6, ease: EASE } },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.94 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: EASE } },
};

export const staggerContainer = (stagger = 0.09, delay = 0) => ({
  hidden: {},
  show: {
    transition: { staggerChildren: stagger, delayChildren: delay },
  },
});

export const heroSlide = {
  enter: { opacity: 0, scale: 1.04 },
  center: { opacity: 1, scale: 1, transition: { duration: 1.1, ease: EASE } },
  exit: { opacity: 0, scale: 1.0, transition: { duration: 0.6, ease: EASE } },
};

export const cardHover = {
  rest: { y: 0, boxShadow: "0 1px 2px rgba(21,21,15,0.04)" },
  hover: {
    y: -6,
    boxShadow: "0 20px 40px -16px rgba(21,21,15,0.22)",
    transition: { duration: 0.35, ease: EASE },
  },
};

export const imageZoom = {
  rest: { scale: 1 },
  hover: { scale: 1.08, transition: { duration: 0.6, ease: EASE } },
};

export const buttonTap = {
  rest: { scale: 1 },
  tap: { scale: 0.96 },
};

export const drawerSlide = {
  hidden: { x: "100%" },
  show: { x: 0, transition: { duration: 0.45, ease: EASE } },
  exit: { x: "100%", transition: { duration: 0.35, ease: EASE } },
};

export const drawerSlideLeft = {
  hidden: { x: "-100%" },
  show: { x: 0, transition: { duration: 0.45, ease: EASE } },
  exit: { x: "-100%", transition: { duration: 0.35, ease: EASE } },
};

export const modalPop = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.35, ease: EASE } },
  exit: { opacity: 0, scale: 0.97, y: 6, transition: { duration: 0.2, ease: EASE } },
};

export const dropdownFade = {
  hidden: { opacity: 0, y: -6 },
  show: { opacity: 1, y: 0, transition: { duration: 0.22, ease: EASE } },
  exit: { opacity: 0, y: -6, transition: { duration: 0.15 } },
};

export const toastSlide = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: EASE } },
  exit: { opacity: 0, y: 10, scale: 0.97, transition: { duration: 0.2 } },
};

export const accordionContent = {
  collapsed: { height: 0, opacity: 0 },
  open: { height: "auto", opacity: 1, transition: { duration: 0.35, ease: EASE } },
};

export const pageTransition = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.3, ease: EASE } },
};

export const viewportOnce = { once: true, margin: "-80px" };
