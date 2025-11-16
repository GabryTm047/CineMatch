import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/pages/app/app';
import { initializeApp, getApps } from 'firebase/app';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import { firebaseConfig, recaptchaAppCheckKey, recaptchaSiteKey } from './firebase.config';

const APP_CHECK_DEBUG_STORAGE_KEY = 'b4c835ab-71ef-4afc-90ca-82dbbda90226';

function configureAppCheckDebugToken(): void {
  if (typeof window === 'undefined') {
    return;
  }
  const hostname = window.location.hostname;
  const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';
  if (!isLocal) {
    return;
  }
  const globalSelf = globalThis as { FIREBASE_APPCHECK_DEBUG_TOKEN?: string | boolean };
  const storedToken = window.localStorage.getItem(APP_CHECK_DEBUG_STORAGE_KEY);
  if (storedToken && storedToken.trim().length > 0) {
    globalSelf.FIREBASE_APPCHECK_DEBUG_TOKEN = storedToken;
  } else {
    globalSelf.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
    console.info(`[AppCheck] Debug token requested. After copying it from the console, run localStorage.setItem("${APP_CHECK_DEBUG_STORAGE_KEY}", "<token>") and reload.`);
  }
}

function initFirebaseWithAppCheck(): void {
  if (!getApps().length) {
    const app = initializeApp(firebaseConfig);
    const appCheckKey = (recaptchaAppCheckKey || '').trim();
    if (appCheckKey && !appCheckKey.startsWith('PASTE_')) {
      configureAppCheckDebugToken();
      initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(appCheckKey),
        isTokenAutoRefreshEnabled: true
      });
      console.info(`[App Check] Attivo con reCAPTCHA key ...${appCheckKey.slice(-6)} su host ${window.location.hostname}`);
    } else {
      console.warn('App Check disabilitato: recaptchaAppCheckKey mancante o placeholder (PASTE_...).');
    }
  }
}

initFirebaseWithAppCheck();

function injectRecaptchaV3(siteKey: string): void {
  const key = (siteKey || '').trim();
  if (!key || key.startsWith('PASTE_')) {
    console.warn('reCAPTCHA standard non configurato: recaptchaSiteKey mancante o placeholder (PASTE_...).');
    return;
  }
  const existing = document.querySelector('script[src^="https://www.google.com/recaptcha/api.js"]');
  if (existing) return;
  const script = document.createElement('script');
  script.src = `https://www.google.com/recaptcha/api.js?render=${key}`;
  script.async = true;
  script.defer = true;
  script.onload = () => console.info(`[reCAPTCHA] Script caricato per key ...${key.slice(-6)}.`);
  script.onerror = () => console.error('[reCAPTCHA] Errore caricamento script.');
  document.head.appendChild(script);
}

injectRecaptchaV3(recaptchaSiteKey);

bootstrapApplication(App, appConfig).catch(err => console.error(err));
