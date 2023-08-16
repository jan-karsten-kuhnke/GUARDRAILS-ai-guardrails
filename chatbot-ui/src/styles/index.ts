import { darkTheme } from "./darkTheme";
import { lightTheme } from "./lightTheme";

const vite_theme = import.meta.env.VITE_THEME;

export const theme= vite_theme === 'light' ? lightTheme : darkTheme;