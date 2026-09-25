"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { translations } from "./translations";

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState("bn"); // Default Bangla as requested!

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLang = localStorage.getItem("edubari_lang");
      if (savedLang && (savedLang === "bn" || savedLang === "en")) {
        setLang(savedLang);
      }
    }
  }, []);

  const changeLanguage = (newLang) => {
    if (newLang === "bn" || newLang === "en") {
      setLang(newLang);
      if (typeof window !== "undefined") {
        localStorage.setItem("edubari_lang", newLang);
      }
    }
  };

  /**
   * Translation function t('domainSearch.titleMain')
   */
  const t = (path) => {
    const keys = path.split(".");
    let current = translations[lang] || translations["bn"];

    for (const key of keys) {
      if (current && current[key] !== undefined) {
        current = current[key];
      } else {
        // Fallback to Bangla
        let fallback = translations["bn"];
        for (const fKey of keys) {
          if (fallback && fallback[fKey] !== undefined) {
            fallback = fallback[fKey];
          } else {
            return path;
          }
        }
        return fallback;
      }
    }
    return current;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang: changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
