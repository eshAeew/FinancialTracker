import { createContext, useContext, ReactNode } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

export type CurrencySettings = {
  defaultCurrency: string;
  currencyPosition: string;
  locale: string;
  dateFormat: string;
  timeFormat: string;
  firstDayOfWeek: string;
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
  locale: "en-US",
  dateFormat: "MM/DD/YYYY",
  timeFormat: "12h",
  firstDayOfWeek: "sunday"
};

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currencySettings, setCurrencySettings] = useLocalStorage<CurrencySettings>(
    "currencySettings",
    defaultCurrencySettings
  );

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