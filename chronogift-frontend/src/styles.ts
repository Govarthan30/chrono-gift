import { createGlobalStyle, styled } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background: ${({ theme }) => theme.backgroundGradient};
    color: ${({ theme }) => theme.text};
    transition: background 0.3s, color 0.3s;
  }

  * {
    box-sizing: border-box;
  }
`;

export const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
`;

export const Card = styled.div`
  background: ${({ theme }) => theme.cardBackground};
  color: ${({ theme }) => theme.cardTextColor};
  max-width: 600px;
  width: 100%;
  margin: 20px auto;
  padding: 20px;
  border: 1px solid ${({ theme }) => theme.inputBorder};
  border-radius: 8px;
  box-shadow: ${({ theme }) => theme.boxShadow};

  @media (min-width: 600px) {
    padding: 40px;
  }
`;

export const Input = styled.input`
  width: 100%;
  padding: 12px;
  margin-bottom: 16px;
  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme.inputBorder};
  background: ${({ theme }) => theme.inputBackground};
  color: ${({ theme }) => theme.inputColor};
  font-size: 16px;
  transition: border-color 0.2s, background 0.3s;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.inputFocusBorder};
  }
`;

export const TextArea = styled.textarea`
  width: 100%;
  padding: 12px;
  margin-bottom: 16px;
  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme.inputBorder};
  background: ${({ theme }) => theme.inputBackground};
  color: ${({ theme }) => theme.inputColor};
  font-size: 16px;
  resize: vertical;
  min-height: 80px;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.inputFocusBorder};
  }
`;

export const Button = styled.button`
  padding: 12px 24px;
  font-size: 16px;
  font-weight: bold;
  color: white;
  background: ${({ theme }) => theme.buttonGradient};
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.buttonHoverGradient};
  }

  &:disabled {
    background: #cccccc;
    cursor: not-allowed;
  }
`;

export const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: ${({ theme }) => theme.secondaryText};
`;

export const ErrorText = styled.p`
  color: ${({ theme }) => theme.errorColor};
  margin-top: -10px;
  margin-bottom: 10px;
`;
