import { useEffect } from 'react';
import { useAppearance } from '@/components/AppearanceProvider';

/**
 * Hook to handle layout preferences and apply them to the application
 */
export function useLayoutPreferences() {
  const { appearanceSettings } = useAppearance();
  
  // Apply animations setting
  useEffect(() => {
    const root = document.documentElement;
    
    if (appearanceSettings.animations) {
      // Enable animations
      root.style.setProperty('--transition-duration', '200ms');
      root.classList.remove('disable-animations');
    } else {
      // Disable animations
      root.style.setProperty('--transition-duration', '0ms');
      root.classList.add('disable-animations');
    }
  }, [appearanceSettings.animations]);
  
  // Apply compact mode setting
  useEffect(() => {
    const root = document.documentElement;
    
    if (appearanceSettings.compactMode) {
      // Enable compact mode
      root.classList.add('compact-mode');
    } else {
      // Disable compact mode
      root.classList.remove('compact-mode');
    }
  }, [appearanceSettings.compactMode]);
  
  // Apply dashboard layout setting
  useEffect(() => {
    const root = document.documentElement;
    
    // Remove all layout classes first
    root.classList.remove(
      'layout-tiles', 
      'layout-list', 
      'layout-compact', 
      'layout-focus'
    );
    
    // Add the selected layout class
    root.classList.add(`layout-${appearanceSettings.dashboardLayout}`);
  }, [appearanceSettings.dashboardLayout]);
  
  return {
    dashboardLayout: appearanceSettings.dashboardLayout,
    animations: appearanceSettings.animations,
    compactMode: appearanceSettings.compactMode
  };
}