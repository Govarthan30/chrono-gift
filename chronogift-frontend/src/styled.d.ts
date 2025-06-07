// styles.d.ts
import "styled-components";

declare module "styled-components" {
  export interface DefaultTheme {
    mode: "light" | "dark"; 
    background: string;
    backgroundGradient: string;
    headingColor: string;

    cardBackground: string;
    cardBg: string;           // duplicate key, keep both for compatibility
    cardTextColor: string;

    textPrimary: string;
    textSecondary: string;
    primaryText: string;
    secondaryText: string;

    buttonBg: string;
    buttonGradient: string;
    buttonHoverBg: string;
    buttonHoverGradient: string;

    inputBorder: string;
    inputBackground: string;
    inputColor: string;
    inputFocusBorder: string;

    errorColor: string;

    subHeadingColor: string;

    footerColor: string;
    footerBg: string;

    logoutBg: string;
    logoutHoverBg: string;

    boxShadow: string;
  }
}
