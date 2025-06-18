import React, { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeContext } from "@USupport-components-library/utils";

import { Root } from "#routes";

import { adminSvc } from "@USupport-components-library/services";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "./App.scss";

const IS_DEV = process.env.NODE_ENV === "development";

// Create a react-query client
const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false } },
});

// AOS imports
import "aos/dist/aos.css";
import AOS from "aos";

function App() {
  AOS.init({
    offset: 10,
    duration: 1000,
    easing: "ease-in-sine",
    delay: 300,
    anchorPlacement: "top-bottom",
    once: false,
  });

  const [isInWelcome, setIsInWelcome] = useState(false);
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      const token = localStorage.getItem("token");
      // If the page is being refreshed, do nothing
      if (!(performance.getEntriesByType("navigation")[0].type === "reload")) {
        if (!IS_DEV && token && !isInWelcome) {
          e.preventDefault();
          e.returnValue = "";
          adminSvc.logout();
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isInWelcome]);

  const [theme, setTheme] = useState("light");

  return (
    <ThemeContext.Provider
      value={{ theme, setTheme, isInWelcome, setIsInWelcome }}
    >
      <div className={`theme-${theme}`}>
        <QueryClientProvider client={queryClient}>
          <Root />
          <ReactQueryDevtools initialOpen />
          <ToastContainer />
        </QueryClientProvider>
      </div>
    </ThemeContext.Provider>
  );
}

export default App;
