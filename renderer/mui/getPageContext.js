import { SheetsRegistry } from "jss";
import { createMuiTheme } from "@material-ui/core/styles";
import { createGenerateClassName } from "@material-ui/styles";
import blue from "@material-ui/core/colors/blue";
import pink from "@material-ui/core/colors/pink";
import red from "@material-ui/core/colors/red";

// A theme with custom primary and secondary color.
// It's optional.
const theme = createMuiTheme({
  palette: {
    primary: blue,
    secondary: pink,
    error: red
    // error: red[500]
    // primary: {
    //   light: blue[300],
    //   main: blue[500],
    //   dark: blue[700]
    // contrastText: getContrastText(blue[500]),
    // },
    // secondary: {
    //   light: pink[300],
    //   main: pink[500],
    //   dark: pink[700]
    // }
  },
  typography: {
    useNextVariants: true,
    fontFamily: ["-apple-system", "BlinkMacSystemFont", '"Segoe UI"', "Roboto", '"Helvetica Neue"', "Arial", "sans-serif", '"Apple Color Emoji"', '"Segoe UI Emoji"', '"Segoe UI Symbol"'].join(","),
    fontWeight300: 300,
    fontWeight400: 400,
    fontWeight500: 500,
    fontWeight700: 700,
    fontSizeSmall: "0.875rem",
    fontSizeSmaller: "0.75rem"
    // fontSize: 9,
    // htmlFontSize: 10
  }
});

function createPageContext() {
  return {
    theme,
    // This is needed in order to deduplicate the injection of CSS in the page.
    sheetsManager: new Map(),
    // This is needed in order to inject the critical CSS.
    sheetsRegistry: new SheetsRegistry(),
    // The standard class name generator.
    generateClassName: createGenerateClassName()
  };
}

let pageContext;

export default function getPageContext() {
  // Make sure to create a new context for every server-side request so that data
  // isn't shared between connections (which would be bad).
  if (!process.browser) {
    return createPageContext();
  }

  // Reuse context on the client-side.
  if (!pageContext) {
    pageContext = createPageContext();
  }

  return pageContext;
}
