import { useState, useEffect } from "react";
import { 
  getFromCookies, 
  storeInCookies, 
  removeFromCookies 
} from "@/lib/cookieStorage";

/**
 * Hook for storing data in browser cookies
 * Similar API to useState, but persists data to cookies
 * @param key The key to use for the cookie
 * @param initialValue The initial value if no data is in cookie
 * @returns A state value and setter function
 */
export function useCookieStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }
    
    try {
      // Get from cookies by key
      const value = getFromCookies<T>(key);
      // Return stored value or initialValue
      return value !== null ? value : initialValue;
    } catch (error) {
      // If error also return initialValue
      console.error("Error reading from cookies:", error);
      return initialValue;
    }
  });
  
  // Return a wrapped version of useState's setter function that
  // persists the new value to cookies
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to cookies
      if (typeof window !== "undefined") {
        storeInCookies(key, valueToStore);
      }
    } catch (error) {
      console.error("Error storing in cookies:", error);
    }
  };
  
  // Check for cookie changes regularly
  // (Cookies don't have a native change event like localStorage)
  useEffect(() => {
    const checkInterval = setInterval(() => {
      try {
        const cookieValue = getFromCookies<T>(key);
        
        // Only update if value is different
        if (cookieValue !== null && JSON.stringify(cookieValue) !== JSON.stringify(storedValue)) {
          setStoredValue(cookieValue);
        }
        
        // If cookie was deleted but we have a value in state, reset to initial
        if (cookieValue === null && storedValue !== initialValue) {
          setStoredValue(initialValue);
        }
      } catch (error) {
        console.error("Error checking cookies for changes:", error);
      }
    }, 1000); // Check every second
    
    return () => {
      clearInterval(checkInterval);
    };
  }, [key, storedValue, initialValue]);
  
  return [storedValue, setValue];
}