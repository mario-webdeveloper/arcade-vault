"use client";

import { useEffect } from "react";

/**
 * Only scroll island of the Home. Mounted once, it watches every `[data-reveal]`
 * element: below the fold it marks them "pending" (globals.css hides those) and
 * flips them to "in" once they scroll into view. Before it runs, if it fails, or
 * with reduced motion, nothing is hidden.
 */
export function ScrollReveal() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const { target, isIntersecting } of entries) {
          if (isIntersecting) {
            target.setAttribute("data-reveal", "in");
            observer.unobserve(target);
          } else {
            target.setAttribute("data-reveal", "pending");
          }
        }
      },
      // A tall section counts as visible once its top edge clears the bottom 10%.
      { rootMargin: "0px 0px -10% 0px" },
    );

    document
      .querySelectorAll("[data-reveal]")
      .forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  return null;
}
