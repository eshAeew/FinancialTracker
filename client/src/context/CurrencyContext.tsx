import { createContext, useContext, ReactNode, useEffect } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { changeLanguage } from "@/i18n";

export type CurrencySettings = {
  defaultCurrency: string;
  currencyPosition: string;
  locale: string;
};

type CurrencyContextType = {
  currencySettings: CurrencySettings;
  setCurrencySettings: (
    settings: CurrencySettings | ((val: CurrencySettings) => CurrencySettings)
  ) => void;
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const defaultCurrencySettings: CurrencySettings = {
  defaultCurrency: "USD",
  currencyPosition: "before",
  locale: "en-US"
};

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currencySettings, setCurrencySettings] = useLocalStorage<CurrencySettings>(
    "currencySettings",
    defaultCurrencySettings
  );

  // Update the language when locale changes
  useEffect(() => {
    changeLanguage(currencySettings.locale);
  }, [currencySettings.locale]);

  return (
    <CurrencyContext.Provider value={{ currencySettings, setCurrencySettings }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}