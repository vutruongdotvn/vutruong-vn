"use client";

import { useEffect } from "react";

export default function FancyboxWrapper() {
  useEffect(() => {
    (async () => {
      const { Fancybox } = await import("@fancyapps/ui");

      Fancybox.bind("[data-fancybox]", {
        Hash: false,
        animated: true,
        showClass: "fancybox-fadeIn",
        hideClass: "fancybox-fadeOut",
        dragToClose: true,
        wheel: "zoom",
        touch: {
          vertical: "close",
        },
        Thumbs: {
          autoStart: true,
          type: "modern",
        },
        Toolbar: {
          display: ["zoom", "slideshow", "fullscreen", "close"],
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