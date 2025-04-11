import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Initialize dark mode before rendering
const initializeDarkMode = () => {
  // Check stored preference
  const storedTheme = localStorage.getItem('theme');
  if (storedTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else if (storedTheme === 'light') {
    document.documentElement.classList.remove('dark');
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    // Use system preference if no stored preference
    document.documentElement.classList.add('dark');
  }
};

initializeDarkMode();
createRoot(document.getElementById("root")!).render(<App />);
