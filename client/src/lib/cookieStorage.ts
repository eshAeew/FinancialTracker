/**
 * Utility for managing data storage in cookies
 */

// Max cookie size is typically 4KB, so we need to handle larger data properly
const MAX_COOKIE_SIZE = 4000; // slightly less than 4KB to be safe

/**
 * Sets a cookie with the given name and value
 * @param name The name of the cookie
 * @param value The value to store
 * @param days The number of days until the cookie expires (default 30 days)
 */
export function setCookie(name: string, value: string, days = 30): void {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `; expires=${date.toUTCString()}`;
  document.cookie = `${name}=${encodeURIComponent(value)}${expires}; path=/`;
}

/**
 * Gets a cookie by name
 * @param name The name of the cookie
 * @returns The cookie value or empty string if not found
 */
export function getCookie(name: string): string {
  const nameEQ = `${name}=`;
  const cookies = document.cookie.split(';');
  
  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i];
    while (cookie.charAt(0) === ' ') {
      cookie = cookie.substring(1, cookie.length);
    }
    if (cookie.indexOf(nameEQ) === 0) {
      return decodeURIComponent(cookie.substring(nameEQ.length, cookie.length));
    }
  }
  return '';
}

/**
 * Deletes a cookie by name
 * @param name The name of the cookie
 */
export function deleteCookie(name: string): void {
  setCookie(name, '', -1);
}

/**
 * Stores data in cookies, handling larger objects by splitting them into chunks
 * @param key The main key for the data
 * @param data The data to store (will be JSON stringified)
 */
export function storeInCookies(key: string, data: any): void {
  try {
    const jsonString = JSON.stringify(data);
    
    // If data is small enough, store it in a single cookie
    if (jsonString.length < MAX_COOKIE_SIZE) {
      setCookie(key, jsonString);
      return;
    }
    
    // Otherwise, split it into chunks
    const totalChunks = Math.ceil(jsonString.length / MAX_COOKIE_SIZE);
    
    // Store metadata about chunks
    setCookie(`${key}_meta`, JSON.stringify({ 
      totalChunks,
      timestamp: new Date().getTime()
    }));
    
    // Store the chunks
    for (let i = 0; i < totalChunks; i++) {
      const start = i * MAX_COOKIE_SIZE;
      const end = Math.min(start + MAX_COOKIE_SIZE, jsonString.length);
      const chunk = jsonString.substring(start, end);
      setCookie(`${key}_chunk_${i}`, chunk);
    }
  } catch (error) {
    console.error('Error storing data in cookies:', error);
  }
}

/**
 * Retrieves data from cookies, handling chunked data
 * @param key The main key for the data
 * @returns The parsed data or null if not found
 */
export function getFromCookies<T>(key: string): T | null {
  try {
    // First try to get it as a single cookie
    const cookieValue = getCookie(key);
    if (cookieValue) {
      return JSON.parse(cookieValue) as T;
    }
    
    // If not found, check if it's stored in chunks
    const metaString = getCookie(`${key}_meta`);
    if (!metaString) {
      return null;
    }
    
    const meta = JSON.parse(metaString);
    const { totalChunks } = meta;
    
    // Reconstruct the data from chunks
    let fullData = '';
    for (let i = 0; i < totalChunks; i++) {
      const chunk = getCookie(`${key}_chunk_${i}`);
      if (!chunk) {
        console.error(`Missing chunk ${i} for ${key}`);
        return null;
      }
      fullData += chunk;
    }
    
    return JSON.parse(fullData) as T;
  } catch (error) {
    console.error('Error retrieving data from cookies:', error);
    return null;
  }
}

/**
 * Removes data from cookies, handling chunked data
 * @param key The main key for the data
 */
export function removeFromCookies(key: string): void {
  // First try to delete it as a single cookie
  deleteCookie(key);
  
  // Then check if it's stored in chunks
  const metaString = getCookie(`${key}_meta`);
  if (metaString) {
    try {
      const meta = JSON.parse(metaString);
      const { totalChunks } = meta;
      
      // Delete all the chunks
      for (let i = 0; i < totalChunks; i++) {
        deleteCookie(`${key}_chunk_${i}`);
      }
      
      // Delete the metadata
      deleteCookie(`${key}_meta`);
    } catch (error) {
      console.error('Error removing data from cookies:', error);
    }
  }
}

// Cookie keys for different data types
export const COOKIE_KEYS = {
  TRANSACTIONS: 'finance_transactions',
  CATEGORIES: 'finance_categories',
  BUDGET_GOALS: 'finance_budget_goals',
  RECURRING_TRANSACTIONS: 'finance_recurring_transactions',
  ACCOUNTS: 'finance_accounts',
  APPEARANCE_SETTINGS: 'finance_appearance_settings',
  CURRENCY_SETTINGS: 'finance_currency_settings'
};