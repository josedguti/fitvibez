/**
 * VibeFit color scheme - feminine yet modern colors (coral, lavender, rose gold, soft pastels)
 */

const primaryColor = "#FF6B6B"; // coral
const secondaryColor = "#A78BFA"; // lavender
const accentColor = "#F8B195"; // rose gold

export const Colors = {
  light: {
    text: "#333333",
    background: "#FFF5F7", // soft pink background
    tint: primaryColor,
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: primaryColor,
    primary: primaryColor,
    secondary: secondaryColor,
    accent: accentColor,
    cardBackground: "#FFFFFF",
    buttonText: "#FFFFFF",
    border: "#E5E5E5",
  },
  dark: {
    text: "#F8F9FA",
    background: "#2D2D3A", // dark purple-ish background
    tint: secondaryColor,
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: secondaryColor,
    primary: "#FF8C94", // lighter coral for dark mode
    secondary: "#B197FC", // lighter lavender for dark mode
    accent: "#F9C29D", // lighter rose gold for dark mode
    cardBackground: "#3D3D4D",
    buttonText: "#FFFFFF",
    border: "#5D5D6D",
  },
};
