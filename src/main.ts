import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/pages/app/app';
import { initializeApp, getApps } from 'firebase/app';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import { firebaseConfig, recaptchaSiteKey } from './firebase.config';

//#region reCAPTCHA v3 standard
function injectRecaptchaV3(siteKey: string): void {
  const key = (siteKey || '').trim();
  if (!key || key.startsWith('PASTE_')) {
    console.info(
      'reCAPTCHA standard non configurato: recaptchaSiteKey mancante o placeholder (PASTE_...).'
    );
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
//#endregion

//#region App-Check
function initFirebaseAppCheck(): void {
  if (!getApps().length) {
    initializeApp(firebaseConfig);
  }

  if (localStorage.getItem('firebase-app-check-debug-token') === 'true') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (self as any).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
    console.info('[AppCheck] Debug Token ATTIVATO');
  }

  initializeAppCheck(initializeApp(firebaseConfig), {
    provider: new ReCaptchaV3Provider(recaptchaSiteKey),
    isTokenAutoRefreshEnabled: true,
  });

  console.info('[AppCheck] Inizializzato con provider reCAPTCHA v3');
}
initFirebaseAppCheck();
//#endregion

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
