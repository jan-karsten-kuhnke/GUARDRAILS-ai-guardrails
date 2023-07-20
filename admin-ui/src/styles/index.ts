import {darkTheme} from './darkTheme';
import {lightTheme} from './lightTheme';
const theme = import.meta.env.VITE_THEME;


export const styles= theme === 'light' ? lightTheme : darkTheme;