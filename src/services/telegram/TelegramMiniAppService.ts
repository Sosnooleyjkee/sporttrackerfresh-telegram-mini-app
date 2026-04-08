import { Platform } from "react-native";

import { defaultTelegramSession, type TelegramSession, type TelegramThemeSnapshot, type TelegramUserProfile, type TelegramViewportSnapshot } from "@/domain/telegram";
import { appTheme } from "@/theme/appTheme";

type Listener = (session: TelegramSession) => void;

export type TelegramMiniAppController = {
  getSession: () => TelegramSession;
  subscribe: (listener: Listener) => () => void;
  destroy: () => void;
};

function ensureThemeColorMeta() {
  if (typeof document === "undefined") {
    return null;
  }

  let meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", "theme-color");
    document.head.appendChild(meta);
  }

  return meta;
}

function applyWebShellStyles(session: TelegramSession) {
  if (typeof document === "undefined") {
    return;
  }

  const root = document.documentElement;
  const body = document.body;
  const appRoot = document.getElementById("root");
  const themeColorMeta = ensureThemeColorMeta();

  const backgroundColor = appTheme.colors.background;
  const safeBottom = session.viewport.contentSafeAreaBottom || session.viewport.safeAreaBottom || 0;
  const safeTop = session.viewport.contentSafeAreaTop || session.viewport.safeAreaTop || 0;
  const safeLeft = session.viewport.contentSafeAreaLeft || session.viewport.safeAreaLeft || 0;
  const safeRight = session.viewport.contentSafeAreaRight || session.viewport.safeAreaRight || 0;

  root.style.height = "100%";
  root.style.backgroundColor = backgroundColor;
  root.style.setProperty("--app-safe-area-top", `${safeTop}px`);
  root.style.setProperty("--app-safe-area-bottom", `${safeBottom}px`);
  root.style.setProperty("--app-safe-area-left", `${safeLeft}px`);
  root.style.setProperty("--app-safe-area-right", `${safeRight}px`);
  root.style.setProperty("--app-viewport-stable-height", session.viewport.stableHeight ? `${session.viewport.stableHeight}px` : "100dvh");
  root.style.setProperty("--app-viewport-height", session.viewport.height ? `${session.viewport.height}px` : "100dvh");

  body.style.minHeight = "100%";
  body.style.margin = "0";
  body.style.backgroundColor = backgroundColor;
  body.style.color = appTheme.colors.textPrimary;
  body.style.overscrollBehavior = "none";
  body.style.setProperty("-webkit-overflow-scrolling", "touch");
  body.style.touchAction = "manipulation";

  if (appRoot) {
    appRoot.style.minHeight = "100%";
    appRoot.style.backgroundColor = backgroundColor;
    appRoot.style.isolation = "isolate";
  }

  if (themeColorMeta) {
    themeColorMeta.setAttribute("content", backgroundColor);
  }
}

function mapUser(user: { id: number; username?: string; first_name?: string } | undefined): TelegramUserProfile | null {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    username: user.username ?? null,
    firstName: user.first_name ?? null,
  };
}

function mapTheme(theme: {
  bgColor?: string;
  secondaryBgColor?: string;
  headerBgColor?: string;
  bottomBarBgColor?: string;
  textColor?: string;
  hintColor?: string;
  buttonColor?: string;
  isDark?: boolean;
}): TelegramThemeSnapshot {
  return {
    backgroundColor: theme.bgColor ?? null,
    secondaryBackgroundColor: theme.secondaryBgColor ?? null,
    headerBackgroundColor: theme.headerBgColor ?? null,
    bottomBarColor: theme.bottomBarBgColor ?? null,
    textColor: theme.textColor ?? null,
    hintColor: theme.hintColor ?? null,
    buttonColor: theme.buttonColor ?? null,
    isDark: Boolean(theme.isDark ?? true),
  };
}

function mapViewport(viewport: {
  width?: number;
  height?: number;
  stableHeight?: number;
  isExpanded?: boolean;
  isFullscreen?: boolean;
  safeAreaInsetTop?: number;
  safeAreaInsetBottom?: number;
  safeAreaInsetLeft?: number;
  safeAreaInsetRight?: number;
  contentSafeAreaInsetTop?: number;
  contentSafeAreaInsetBottom?: number;
  contentSafeAreaInsetLeft?: number;
  contentSafeAreaInsetRight?: number;
}): TelegramViewportSnapshot {
  return {
    width: viewport.width ?? 0,
    height: viewport.height ?? 0,
    stableHeight: viewport.stableHeight ?? 0,
    isExpanded: Boolean(viewport.isExpanded),
    isFullscreen: Boolean(viewport.isFullscreen),
    safeAreaTop: viewport.safeAreaInsetTop ?? 0,
    safeAreaBottom: viewport.safeAreaInsetBottom ?? 0,
    safeAreaLeft: viewport.safeAreaInsetLeft ?? 0,
    safeAreaRight: viewport.safeAreaInsetRight ?? 0,
    contentSafeAreaTop: viewport.contentSafeAreaInsetTop ?? 0,
    contentSafeAreaBottom: viewport.contentSafeAreaInsetBottom ?? 0,
    contentSafeAreaLeft: viewport.contentSafeAreaInsetLeft ?? 0,
    contentSafeAreaRight: viewport.contentSafeAreaInsetRight ?? 0,
  };
}

export async function initializeTelegramMiniApp(): Promise<TelegramMiniAppController> {
  let currentSession = defaultTelegramSession;
  const listeners = new Set<Listener>();
  const cleanups: Array<() => void> = [];

  const emit = (nextSession: TelegramSession) => {
    currentSession = nextSession;
    applyWebShellStyles(currentSession);
    listeners.forEach((listener) => listener(currentSession));
  };

  const controller: TelegramMiniAppController = {
    getSession: () => currentSession,
    subscribe: (listener) => {
      listeners.add(listener);
      listener(currentSession);
      return () => {
        listeners.delete(listener);
      };
    },
    destroy: () => {
      cleanups.splice(0).forEach((cleanup) => cleanup());
      listeners.clear();
    },
  };

  applyWebShellStyles(currentSession);

  if (Platform.OS !== "web" || typeof window === "undefined" || typeof document === "undefined") {
    return controller;
  }

  try {
    const { init, initData, miniApp, themeParams, viewport } = await import("@tma.js/sdk");
    const isMiniApp = Boolean((window as { Telegram?: { WebApp?: unknown } }).Telegram?.WebApp);

    init();

    if (!isMiniApp) {
      emit({
        ...defaultTelegramSession,
        viewport: {
          ...defaultTelegramSession.viewport,
          width: window.innerWidth,
          height: window.innerHeight,
          stableHeight: window.innerHeight,
        },
      });
      return controller;
    }

    if (!themeParams.isMounted()) {
      themeParams.mount();
    }
    if (!miniApp.isMounted()) {
      miniApp.mount();
    }
    if (!viewport.isMounted()) {
      await viewport.mount();
    }

    initData.restore();

    if (!themeParams.isCssVarsBound()) {
      cleanups.push(themeParams.bindCssVars());
    }
    if (!miniApp.isCssVarsBound()) {
      cleanups.push(miniApp.bindCssVars());
    }
    if (!viewport.isCssVarsBound()) {
      cleanups.push(viewport.bindCssVars());
    }

    const buildSession = (): TelegramSession => ({
      isMiniApp,
      user: mapUser(initData.user()),
      theme: mapTheme({
        bgColor: themeParams.bgColor(),
        secondaryBgColor: themeParams.secondaryBgColor(),
        headerBgColor: themeParams.headerBgColor(),
        bottomBarBgColor: themeParams.bottomBarBgColor(),
        textColor: themeParams.textColor(),
        hintColor: themeParams.hintColor(),
        buttonColor: themeParams.buttonColor(),
        isDark: themeParams.isDark(),
      }),
      viewport: mapViewport({
        width: viewport.width(),
        height: viewport.height(),
        stableHeight: viewport.stableHeight(),
        isExpanded: viewport.isExpanded(),
        isFullscreen: viewport.isFullscreen(),
        safeAreaInsetTop: viewport.safeAreaInsetTop(),
        safeAreaInsetBottom: viewport.safeAreaInsetBottom(),
        safeAreaInsetLeft: viewport.safeAreaInsetLeft(),
        safeAreaInsetRight: viewport.safeAreaInsetRight(),
        contentSafeAreaInsetTop: viewport.contentSafeAreaInsetTop(),
        contentSafeAreaInsetBottom: viewport.contentSafeAreaInsetBottom(),
        contentSafeAreaInsetLeft: viewport.contentSafeAreaInsetLeft(),
        contentSafeAreaInsetRight: viewport.contentSafeAreaInsetRight(),
      }),
    });

    const syncTelegramChrome = () => {
      try {
        miniApp.setBgColor(appTheme.colors.background);
      } catch {}
      try {
        miniApp.setHeaderColor(appTheme.colors.background);
      } catch {}
      try {
        miniApp.setBottomBarColor(appTheme.colors.surface);
      } catch {}
    };

    syncTelegramChrome();

    try {
      viewport.expand();
    } catch {}

    emit(buildSession());

    cleanups.push(themeParams.state.sub(() => {
      syncTelegramChrome();
      emit(buildSession());
    }));
    cleanups.push(viewport.state.sub(() => emit(buildSession())));
    cleanups.push(initData.state.sub(() => emit(buildSession())));

    try {
      miniApp.ready();
    } catch {}
  } catch {
    emit({
      ...defaultTelegramSession,
      viewport: {
        ...defaultTelegramSession.viewport,
        width: window.innerWidth,
        height: window.innerHeight,
        stableHeight: window.innerHeight,
      },
    });
  }

  return controller;
}
