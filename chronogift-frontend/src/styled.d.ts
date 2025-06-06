// src/styled.d.ts
import "styled-components";

declare module "styled-components" {
  export interface DefaultTheme {
    background: string;
    text: string;
    buttonBg: string;
    buttonHoverBg: string;
    backgroundGradient: string;
    headingColor: string;
    cardBackground: string;
    cardTextColor: string;
    inputBorder: string;
    inputBackground: string;
    inputColor: string;
    inputFocusBorder: string;
    buttonGradient: string;
    buttonHoverGradient: string;
    errorColor: string;
    subHeadingColor: string;
    footerColor: string;
    footerBg: string;
    secondaryText: string;
    primaryText: string;
    logoutBg: string;
    logoutHoverBg: string;
    cardBg: string;
    boxShadow: string;
    textPrimary: string;
    textSecondary: string;
  }
}
