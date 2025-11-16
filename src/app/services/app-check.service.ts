import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { initializeAppCheck, ReCaptchaV3Provider, AppCheck } from 'firebase/app-check';
import { firebaseConfig, recaptchaSiteKey } from '../../firebase.config';

@Injectable({
  providedIn: 'root'
})
export class AppCheckService {
  private appCheckInstance: AppCheck | null = null;

  constructor() {
    this.initAppCheck();
  }

  private initAppCheck(): void {
    const app = initializeApp(firebaseConfig);

    this.appCheckInstance = initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(recaptchaSiteKey),
      isTokenAutoRefreshEnabled: true
    });
    console.log('[App Check Service] Inizializzato con reCAPTCHA key ...' + recaptchaSiteKey.slice(-6));
  }

  // Se un domani ti serve l'istanza:
  get instance(): AppCheck | null {
    return this.appCheckInstance;
  }
}
