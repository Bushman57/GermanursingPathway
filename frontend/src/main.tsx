import React from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { I18nextProvider } from "react-i18next";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

import { AppProviders } from "@/components/providers/AppProviders";
import { registerServiceWorker } from "@/lib/registerServiceWorker";
import { getRouter } from "./router";
import i18n from "./i18n";
import "./styles.css";

const router = getRouter();

if (import.meta.env.PROD) {
  registerServiceWorker(import.meta.env.BASE_URL);
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <I18nextProvider i18n={i18n}>
      <AppProviders>
        <RouterProvider router={router} />
        <Analytics />
        <SpeedInsights />
      </AppProviders>
    </I18nextProvider>
  </React.StrictMode>,
);
