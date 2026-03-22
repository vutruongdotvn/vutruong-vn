"use client";

import { useEffect } from "react";

export default function FancyboxWrapper() {
  useEffect(() => {
    (async () => {
      const { Fancybox } = await import("@fancyapps/ui");

      Fancybox.bind("[data-fancybox]", {
        dragToClose: true,
        zoomEffect: false,
        Hash: false,
        showClass: "f-fadeIn",
        hideClass: "f-fadeOut",
        Carousel: {
          Toolbar: {
           display: {
           left: ["count"],
            middle: [],
           right: [],
      },
    },
    Thumbs: false
  },
      });
    })();

    return () => {
      import("@fancyapps/ui").then(({ Fancybox }) => {
        Fancybox.destroy();
      });
    };
  }, []);

  return null;
}