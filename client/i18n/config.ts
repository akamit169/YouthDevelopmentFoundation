import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Import translation files
import enTranslations from "./locales/en.json";
import hiTranslations from "./locales/hi.json";
import bnTranslations from "./locales/bn.json";
import taTranslations from "./locales/ta.json";
import teTranslations from "./locales/te.json";

const resources = {
  en: {
    translation: enTranslations,
  },
  hi: {
    translation: hiTranslations,
  },
  bn: {
    translation: bnTranslations,
  },
  ta: {
    translation: taTranslations,
  },
  te: {
    translation: teTranslations,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    debug: false,

    interpolation: {
      escapeValue: false,
    },

    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      lookupLocalStorage: "ydf-language",
      caches: ["localStorage"],
    },
  });

export default i18n;
