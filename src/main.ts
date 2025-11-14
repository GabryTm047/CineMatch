import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/pages/app/app';
import { initializeApp, getApps } from 'firebase/app';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import { firebaseConfig, recaptchaV3SiteKey, recaptchaSiteKey } from './firebase.config';

// Initialize Firebase & (optionally) App Check before Angular bootstrap.
function initFirebaseWithAppCheck(): void {
  if (!getApps().length) {
    const app = initializeApp(firebaseConfig);
    // Enable App Check only if a valid site key is provided
    if (recaptchaV3SiteKey && !recaptchaV3SiteKey.startsWith('PASTE_')) {
      initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(recaptchaV3SiteKey),
        isTokenAutoRefreshEnabled: true
      });
    } else {
      // eslint-disable-next-line no-console
      console.warn('App Check disabilitato: recaptchaV3SiteKey non configurata.');
    }
  }
}

initFirebaseWithAppCheck();

// Dynamically inject standard reCAPTCHA v3 script using site key from config
function injectRecaptchaV3(siteKey: string): void {
  const existing = document.querySelector('script[src^="https://www.google.com/recaptcha/api.js"]');
  if (existing) return;
  const script = document.createElement('script');
  script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);
}

injectRecaptchaV3(recaptchaSiteKey);

bootstrapApplication(App, appConfig).catch(err => console.error(err));
