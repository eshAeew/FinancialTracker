import { useEffect } from "react";
import { useCookieStorage } from "./useCookieStorage";
import { COOKIE_KEYS } from "@/lib/cookieStorage";

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
  const [appearanceSettings, setAppearanceSettings] = useCookieStorage<AppearanceSettings>(COOKIE_KEYS.APPEARANCE_SETTINGS, {
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
      small: "text-size-small",
      medium: "text-size-medium",
      large: "text-size-large"
    };
    
    // Apply border radius
    const radiusClasses = {
      none: "radius-none",
      medium: "radius-medium",
      large: "radius-large"
    };

    // Remove any existing font size classes
    document.documentElement.classList.remove("text-size-small", "text-size-medium", "text-size-large");
    // Add the selected font size class
    document.documentElement.classList.add(fontSizeClasses[appearanceSettings.fontSize as keyof typeof fontSizeClasses]);
    
    // Remove any existing border radius classes
    document.documentElement.classList.remove("radius-none", "radius-medium", "radius-large");
    // Add the selected border radius class
    document.documentElement.classList.add(radiusClasses[appearanceSettings.borderRadius as keyof typeof radiusClasses]);
    
    // Update the document body's font size directly for better coverage
    if (appearanceSettings.fontSize === "small") {
      document.body.style.fontSize = "0.875rem";
    } else if (appearanceSettings.fontSize === "large") {
      document.body.style.fontSize = "1.125rem";
    } else {
      document.body.style.fontSize = "1rem";
    }
    
    console.log(`Applied appearance settings - Font: ${appearanceSettings.fontSize}, Border Radius: ${appearanceSettings.borderRadius}`);
  }, [appearanceSettings.fontSize, appearanceSettings.borderRadius]);

  return {
    appearanceSettings,
    setAppearanceSettings
  };
}