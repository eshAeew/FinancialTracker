import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Initialize dark mode before rendering
const initializeDarkMode = () => {
  // Check stored preference
  const storedTheme = localStorage.getItem('theme');
  
  if (storedTheme === 'dark') {
    // User explicitly selected dark mode
    document.documentElement.classList.add('dark');
  } else if (storedTheme === 'light') {
    // User explicitly selected light mode
    document.documentElement.classList.remove('dark');
  } else {
    // No stored preference, check system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
  
  // Log the state for debugging
  console.log(`Theme initialized: ${document.documentElement.classList.contains('dark') ? 'dark' : 'light'}`);
};

initializeDarkMode();
createRoot(document.getElementById("root")!).render(<App />);
