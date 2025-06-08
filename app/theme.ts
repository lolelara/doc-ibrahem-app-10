import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  direction: 'rtl',
  palette: {
    primary: {
      main: '#00A3B4', // Fitryne blue-green color
      light: '#33B5C3',
      dark: '#007280',
      contrastText: '#fff',
    },
    secondary: {
      main: '#4CAF50', // Fitryne green color
      light: '#70BF73',
      dark: '#357A38',
      contrastText: '#fff',
    },
    background: {
      default: '#f5f5f5',
      paper: '#fff',
    },
  },
  typography: {
    fontFamily: [
      'Cairo',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontSize: '1rem',
          padding: '8px 24px',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
  },
});

export default theme; 