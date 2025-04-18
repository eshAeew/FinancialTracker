import React, { createContext, useContext, ReactNode } from "react";
import { useAppearanceSettings, AppearanceSettings } from "@/hooks/useAppearanceSettings";

type AppearanceContextType = {
  appearanceSettings: AppearanceSettings;
  setAppearanceSettings: (
    settings: AppearanceSettings | ((val: AppearanceSettings) => AppearanceSettings)
  ) => void;
};

const AppearanceContext = createContext<AppearanceContextType | undefined>(undefined);

export function AppearanceProvider({ children }: { children: ReactNode }) {
  const { appearanceSettings, setAppearanceSettings } = useAppearanceSettings();

  return (
    <AppearanceContext.Provider value={{ appearanceSettings, setAppearanceSettings }}>
      <div className={`app-container ${appearanceSettings.fontSize === "small" ? "text-size-small" : appearanceSettings.fontSize === "large" ? "text-size-large" : "text-size-medium"}`}>
        {children}
      </div>
    </AppearanceContext.Provider>
  );
}

export const useAppearance = () => {
  const context = useContext(AppearanceContext);
  if (context === undefined) {
    throw new Error("useAppearance must be used within an AppearanceProvider");
  }
  return context;
};