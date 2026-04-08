export type TelegramUserProfile = {
  id: number;
  username: string | null;
  firstName: string | null;
};

export type TelegramThemeSnapshot = {
  backgroundColor: string | null;
  secondaryBackgroundColor: string | null;
  headerBackgroundColor: string | null;
  bottomBarColor: string | null;
  textColor: string | null;
  hintColor: string | null;
  buttonColor: string | null;
  isDark: boolean;
};

export type TelegramViewportSnapshot = {
  width: number;
  height: number;
  stableHeight: number;
  isExpanded: boolean;
  isFullscreen: boolean;
  safeAreaTop: number;
  safeAreaBottom: number;
  safeAreaLeft: number;
  safeAreaRight: number;
  contentSafeAreaTop: number;
  contentSafeAreaBottom: number;
  contentSafeAreaLeft: number;
  contentSafeAreaRight: number;
};

export type TelegramSession = {
  isMiniApp: boolean;
  user: TelegramUserProfile | null;
  theme: TelegramThemeSnapshot;
  viewport: TelegramViewportSnapshot;
};

export const defaultTelegramSession: TelegramSession = {
  isMiniApp: false,
  user: null,
  theme: {
    backgroundColor: null,
    secondaryBackgroundColor: null,
    headerBackgroundColor: null,
    bottomBarColor: null,
    textColor: null,
    hintColor: null,
    buttonColor: null,
    isDark: true,
  },
  viewport: {
    width: 0,
    height: 0,
    stableHeight: 0,
    isExpanded: false,
    isFullscreen: false,
    safeAreaTop: 0,
    safeAreaBottom: 0,
    safeAreaLeft: 0,
    safeAreaRight: 0,
    contentSafeAreaTop: 0,
    contentSafeAreaBottom: 0,
    contentSafeAreaLeft: 0,
    contentSafeAreaRight: 0,
  },
};
