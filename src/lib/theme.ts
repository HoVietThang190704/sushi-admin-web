import { ThemeConfig, theme } from 'antd';

/**
 * Centralized Design Tokens for Sushi Platform
 * All colors are sourced from Tailwind theme definitions in globals.css
 */
export const SUSHICOLORS = {
  primary: '#e53935',
  primaryHover: '#ef4444',
  primaryDark: '#b71c1c',

  bg: '#141416',
  surface: '#1e1e22',
  card: '#25252a',
  cardHover: '#2e2e34',

  border: '#36363d',
  borderSubtle: '#25252a',

  text: '#f8fafc',
  textMuted: '#cbd5e1',
  textDim: '#94a3b8',

  gold: '#f59e0b',
  emerald: '#10b981',
} as const;

/**
 * Centralized Typography Scale & Fonts Tokens
 */
export const SUSHITYPO = {
  fontFamily: 'var(--font-sans)',
  fontFamilyMono: 'var(--font-mono)',
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
  },
} as const;

/**
 * Ant Design ConfigProvider Theme
 */
export const antdThemeConfig: ThemeConfig = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: SUSHICOLORS.primary,
    colorBgBase: SUSHICOLORS.bg,
    colorBgContainer: SUSHICOLORS.surface,
    colorBgElevated: SUSHICOLORS.card,
    colorBorder: SUSHICOLORS.border,
    colorBorderSecondary: SUSHICOLORS.borderSubtle,
    colorText: SUSHICOLORS.text,
    colorTextSecondary: SUSHICOLORS.textMuted,
    colorTextTertiary: SUSHICOLORS.textDim,
    colorTextPlaceholder: SUSHICOLORS.textDim,
    borderRadius: 10,
    fontFamily: SUSHITYPO.fontFamily,
    fontSize: SUSHITYPO.fontSize.sm,
  },
  components: {
    Card: {
      colorBgContainer: SUSHICOLORS.card,
      colorBorderSecondary: SUSHICOLORS.border,
    },
    Table: {
      colorBgContainer: SUSHICOLORS.card,
      borderColor: SUSHICOLORS.border,
      headerBg: SUSHICOLORS.surface,
      headerColor: SUSHICOLORS.textMuted,
      fontSize: SUSHITYPO.fontSize.sm,
    },
    Input: {
      colorBgContainer: SUSHICOLORS.surface,
      colorBorder: SUSHICOLORS.border,
      colorTextPlaceholder: '#94a3b8',
      activeBorderColor: SUSHICOLORS.primary,
      hoverBorderColor: SUSHICOLORS.primaryHover,
      fontSize: SUSHITYPO.fontSize.sm,
    },
    Button: {
      colorPrimary: SUSHICOLORS.primary,
      colorPrimaryHover: SUSHICOLORS.primaryHover,
      colorPrimaryActive: SUSHICOLORS.primaryDark,
      fontSize: SUSHITYPO.fontSize.sm,
    },
  },
};
