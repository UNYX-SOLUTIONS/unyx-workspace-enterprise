import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n.use(initReactI18next).init({
  resources: {
    es: { translation: { dashboard: "Dashboard", proformas: "Proformas" } },
    en: { translation: { dashboard: "Dashboard", proformas: "Quotations" } },
  },
  lng: "es",
  fallbackLng: "es",
  interpolation: { escapeValue: false },
});
