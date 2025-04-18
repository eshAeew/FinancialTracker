import { useEffect } from "react";
import { useLocalStorage } from "./useLocalStorage";

export type AppearanceSettings = {
  colorScheme: string;
  fontSize: string;
  borderRadius: string;
  animations: boolean;
  compactMode: boolean;
  showTotalInSidebar: boolean;
  layoutDensity: string;
  menuPosition: string;
  dashboardLayout: string;
  cardStyle: string;
};

export function useAppearanceSettings() {
  const [appearanceSettings, setAppearanceSettings] = useLocalStorage<AppearanceSettings>("appearanceSettings", {
    colorScheme: "blue",
    fontSize: "medium",
    borderRadius: "medium",
    animations: true,
    compactMode: false,
    showTotalInSidebar: true,
    layoutDensity: "comfortable",
    menuPosition: "left",
    dashboardLayout: "tiles",
    cardStyle: "modern"
  });

  // Apply the appearance settings to the document
  useEffect(() => {
    // Apply font size
    const fontSizeClasses = {
      small: "text-sm",
      medium: "text-base",
      large: "text-lg"
    };
    
    // Apply border radius
    const borderRadiusValues = {
      none: "0",
      medium: "0.5rem",
      large: "1rem"
    };

    // Remove any existing font size classes
    document.documentElement.classList.remove("text-sm", "text-base", "text-lg");
    // Add the selected font size class
    document.documentElement.classList.add(fontSizeClasses[appearanceSettings.fontSize as keyof typeof fontSizeClasses]);
    
    // Set custom property for border radius that can be used throughout the app
    document.documentElement.style.setProperty('--border-radius', borderRadiusValues[appearanceSettings.borderRadius as keyof typeof borderRadiusValues]);
    
    console.log(`Applied appearance settings - Font: ${appearanceSettings.fontSize}, Border Radius: ${appearanceSettings.borderRadius}`);
  }, [appearanceSettings.fontSize, appearanceSettings.borderRadius]);

  return {
    appearanceSettings,
    setAppearanceSettings
  };
}