import { createTheme } from '@mui/material/styles';
import colors from './colors';
import '@fontsource/open-sans/400.css';
import '@fontsource/open-sans/500.css';
import '@fontsource/open-sans/600.css';
import '@fontsource/open-sans/700.css';

declare module '@mui/material/styles' {
  interface Theme {
    custom: {
      colors: typeof colors;
    };
  }
  interface ThemeOptions {
    custom?: {
      colors?: typeof colors;
    };
  }
}

declare module '@mui/material/Button' {
  interface ButtonPropsSizeOverrides {
    xsmall: true;
    xlarge: true;
    xxlarge: true;
  }
}

export const theme = createTheme({
  custom: {
    colors,
  },
  typography: {
    fontFamily: ['OpenSans', 'Arial', 'Cambria'].join(','),

    fontSize: 14,

    button: {
      textTransform: 'none',
    },

    h1: {
      fontSize: '28px',
      fontWeight: 700,
    },
    h2: {
      fontSize: '24px',
      fontWeight: 700,
    },
    h3: {
      fontSize: '22px',
      fontWeight: 700,
    },
    h4: {
      fontSize: '20px',
      fontWeight: 400,
    },
    h5: {
      fontSize: '16px',
      fontWeight: 400,
    },
    h6: {
      fontSize: '14px',
      fontWeight: 400,
    },
    body1: {
      fontSize: '14px',
      fontWeight: 400,
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '12px',
      fontWeight: 400,
      lineHeight: 1.43,
    },
    caption: {
      fontSize: '12px',
    },
    overline: {
      fontSize: '12px',
      textTransform: 'uppercase',
      letterSpacing: '1px',
      fontWeight: 500,
    },
  },

  palette: {
    primary: {
      light: colors.lightPink,
      main: colors.moreDarkGrey,
      dark: colors.moreDarkGrey,
    },
    secondary: {
      light: colors.slateLight,
      main: colors.grey,
      dark: colors.slate,
    },
    text: {
      primary: '#191818',
      secondary: '#64748B',
      disabled: '#CBD5E1',
    },
  },

  components: {
    MuiTableHead: {
      styleOverrides: {
        root: {
          padding: '12px',
          fontSize: '14px',
          fontWeight: 700,
          color: '#333',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: '12px',
          fontSize: '14px',
          fontWeight: 400,
          color: '#333',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          backgroundColor: '#f5f5f5',
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: colors.moreDarkGrey,
          },
        },
        input: {
          padding: '10px 14px',
          fontSize: '14px',
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          '&.Mui-focused': {
            color: colors.moreDarkGrey,
          },
        },
      },
    },

    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
        },
      },
      variants: [
        {
          props: { size: 'xsmall' },
          style: {
            fontSize: '14px',
            padding: '4px 10px',
            width: 64,
            height: 32,
          },
        },
        {
          props: { size: 'small' },
          style: {
            fontSize: '14px',
            padding: '6px 12px',
            width: 80,
            height: 40,
          },
        },
        {
          props: { size: 'medium' },
          style: {
            fontSize: '14px',
            padding: '6px 16px',
            width: 82,
            height: 40,
          },
        },
        {
          props: { size: 'large' },
          style: {
            fontSize: '14px',
            padding: '8px 20px',
            width: 96,
            height: 40,
          },
        },
        {
          props: { size: 'xlarge' },
          style: {
            fontSize: '14px',
            padding: '4px 20px',
            width: 100,
            height: 40,
          },
        },
        {
          props: { size: 'xxlarge' },
          style: {
            fontSize: '14px',
            padding: '8px',
            width: 118,
            height: 40,
          },
        },
      ],
    },
  },
});
