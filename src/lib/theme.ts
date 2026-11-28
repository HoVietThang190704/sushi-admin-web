import { ThemeConfig, theme } from 'antd';

/**
 * Centralized Design Tokens for Sushi Platform
 * Obsidian Editorial & Architectural Dark POS Theme
 */
export const SUSHICOLORS = {
  primary: '#dc2626',
  primaryHover: '#ef4444',
  primaryDark: '#991b1b',

  bg: '#0c0d0f',
  surface: '#18191d',
  card: '#131417',
  cardHover: '#1d1f24',

  border: '#262830',
  borderSubtle: '#1c1e24',

  text: '#f4f4f5',
  textMuted: '#a1a1aa',
  textDim: '#71717a',

  gold: '#e5a93c',
  emerald: '#10b981',
} as const;

export const SUSHITYPO = {
  fontFamily: 'var(--font-sans)',
  fontFamilyMono: 'var(--font-mono)',
  fontSize: {
    xs: 12,
    sm: 13,
    base: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
  },
} as const;

export const antdThemeConfig: ThemeConfig = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: SUSHICOLORS.primary,
    controlItemBgActive: '#22242b',
    controlItemBgHover: SUSHICOLORS.cardHover,
    colorBgBase: SUSHICOLORS.bg,
    colorBgContainer: SUSHICOLORS.surface,
    colorBgElevated: SUSHICOLORS.card,
    colorBorder: SUSHICOLORS.border,
    colorBorderSecondary: SUSHICOLORS.borderSubtle,
    colorText: SUSHICOLORS.text,
    colorTextSecondary: SUSHICOLORS.textMuted,
    colorTextTertiary: SUSHICOLORS.textDim,
    colorTextPlaceholder: SUSHICOLORS.textDim,
    borderRadius: 8,
    fontFamily: SUSHITYPO.fontFamily,
    fontSize: 13,
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
      fontSize: 13,
    },
    Input: {
      colorBgContainer: SUSHICOLORS.surface,
      colorBorder: SUSHICOLORS.border,
      colorTextPlaceholder: '#71717a',
      activeBorderColor: '#525665',
      hoverBorderColor: '#3f424e',
      fontSize: 13,
    },
    Select: {
      colorBgContainer: SUSHICOLORS.surface,
      colorBgElevated: SUSHICOLORS.card,
      colorBorder: SUSHICOLORS.border,
      colorText: SUSHICOLORS.text,
      colorTextPlaceholder: '#71717a',
      optionSelectedBg: '#22242b',
      optionSelectedColor: '#ffffff',
      optionActiveBg: SUSHICOLORS.cardHover,
      activeBorderColor: '#525665',
      hoverBorderColor: '#3f424e',
      borderRadius: 8,
      fontSize: 13,
    },
    Button: {
      colorPrimary: SUSHICOLORS.primary,
      colorPrimaryHover: SUSHICOLORS.primaryHover,
      colorPrimaryActive: SUSHICOLORS.primaryDark,
      defaultBg: SUSHICOLORS.surface,
      defaultBorderColor: SUSHICOLORS.border,
      defaultColor: SUSHICOLORS.text,
      defaultHoverBg: SUSHICOLORS.cardHover,
      defaultHoverBorderColor: '#3f424e',
      defaultHoverColor: '#ffffff',
      defaultShadow: 'none',
      primaryShadow: 'none',
      dangerShadow: 'none',
      borderRadius: 8,
      fontSize: 13,
    },
    Menu: {
      itemBg: 'transparent',
      itemColor: SUSHICOLORS.textMuted,
      itemHoverBg: SUSHICOLORS.cardHover,
      itemHoverColor: SUSHICOLORS.text,
      itemSelectedBg: '#1d1f25',
      itemSelectedColor: '#ffffff',
      itemBorderRadius: 7,
      itemMarginInline: 8,
      itemMarginBlock: 2,
      iconSize: 17,
      subMenuItemBg: 'transparent',
      darkItemBg: 'transparent',
      darkItemSelectedBg: '#1d1f25',
      darkItemSelectedColor: '#ffffff',
      darkItemHoverBg: SUSHICOLORS.cardHover,
      darkItemColor: SUSHICOLORS.textMuted,
      darkItemHoverColor: SUSHICOLORS.text,
      darkSubMenuItemBg: 'transparent',
    },
    Layout: {
      siderBg: '#101114',
      headerBg: '#0c0d0f',
      bodyBg: SUSHICOLORS.bg,
      triggerBg: SUSHICOLORS.surface,
      triggerColor: SUSHICOLORS.textMuted,
    },
    Dropdown: {
      colorBgElevated: '#16171b',
      colorText: SUSHICOLORS.text,
      colorTextDescription: SUSHICOLORS.textDim,
      colorSplit: SUSHICOLORS.border,
      paddingBlock: 5,
    },
  },
};
