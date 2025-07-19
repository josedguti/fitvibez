/**
 * VibeFit color scheme - light, subtle, and modern colors (soft pastels and neutrals)
 */

const primaryColor = "#E8A5A5"; // very light coral/rose
const secondaryColor = "#D4C5F4"; // very light lavender
const accentColor = "#F5E6D3"; // very light rose gold/beige

export const Colors = {
  light: {
    text: "#2C2C2C",
    background: "#FAFAFA", // very light neutral background
    tint: primaryColor,
    icon: "#8B8B8B",
    tabIconDefault: "#8B8B8B",
    tabIconSelected: primaryColor,
    primary: primaryColor,
    secondary: secondaryColor,
    accent: accentColor,
    cardBackground: "#FFFFFF",
    buttonText: "#FFFFFF",
    border: "#E8E8E8",
  },
  dark: {
    text: "#F0F0F0",
    background: "#1C1C1E", // subtle dark background
    tint: secondaryColor,
    icon: "#A0A0A0",
    tabIconDefault: "#A0A0A0",
    tabIconSelected: secondaryColor,
    primary: "#E8A5A5", // light coral for dark mode
    secondary: "#D4C5F4", // light lavender for dark mode
    accent: "#F5E6D3", // light rose gold for dark mode
    cardBackground: "#2C2C2E",
    buttonText: "#FFFFFF",
    border: "#3C3C3E",
  },
};
