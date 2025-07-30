import React, { useContext } from 'react';
import { ThemeContext } from './ThemeContext';

const HomePage = () => {
  const { theme, setTheme } = useContext(ThemeContext);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <div>
      <button onClick={toggleTheme} style={{ marginBottom: 16 }}>
        Switch to {theme === 'light' ? 'Dark' : 'Light'} Theme
      </button>
      {/* ...existing code... */}
    </div>
  );
};

export default HomePage;