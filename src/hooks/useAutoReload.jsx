import { useEffect } from "react";

const EIGHT_HOURS = 9 * 60 * 60 * 1000;
const KEY = "appStartTime";

export default function useAutoReload() {
  useEffect(() => {
    if (!localStorage.getItem(KEY)) {
      localStorage.setItem(KEY, Date.now().toString());
    }

    const checkReload = () => {
      const start = Number(localStorage.getItem(KEY));

      if (Date.now() - start >= EIGHT_HOURS) {
        localStorage.setItem(KEY, Date.now().toString());
        window.location.reload();
      }
    };

    const interval = setInterval(checkReload, 60 * 1000);

    window.addEventListener("focus", checkReload);
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) {
        checkReload();
      }
    });

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", checkReload);
      document.removeEventListener("visibilitychange", checkReload);
    };
  }, []);
}