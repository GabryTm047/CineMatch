import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { getApps, initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInAnonymously,
  updateProfile,
} from 'firebase/auth';
import { firebaseConfig } from '../../firebase.config';

export interface AuthUser {
  readonly uid: string;
  readonly name: string;
  readonly email: string;
  readonly isGuest: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly router = inject(Router);
  private readonly currentUserSignal = signal<AuthUser | null>(null);
  private firebaseAuth = this.ensureFirebase();

  readonly currentUser = computed(() => this.currentUserSignal());
  readonly isLoggedIn = computed(() => this.currentUserSignal() !== null);

  constructor() {
    onAuthStateChanged(this.firebaseAuth, (user: User | null) => {
      if (user) {
        const mapped: AuthUser = {
          uid: user.uid,
          name: user.displayName ?? user.email ?? 'Utente',
          email: user.email ?? 'unknown@local',
          isGuest: user.isAnonymous ?? false,
        };
        this.setCurrentUser(mapped);
      } else {
        this.setCurrentUser(null);
      }
    });
  }

  async register(name: string, email: string, password: string): Promise<void> {
    const normalizedEmail = email.trim().toLowerCase();
    if (!name.trim() || !password.trim()) {
      throw new Error('Per registrarti compila tutti i campi richiesti.');
    }

    const cred = await createUserWithEmailAndPassword(
      this.firebaseAuth,
      normalizedEmail,
      password.trim()
    );
    if (cred.user && name.trim()) {
      await updateProfile(cred.user, { displayName: name.trim() });
    }
    await this.router.navigate(['/home']);
  }

  async login(email: string, password: string): Promise<void> {
    const normalizedEmail = email.trim().toLowerCase();
    await signInWithEmailAndPassword(this.firebaseAuth, normalizedEmail, password.trim());
    await this.router.navigate(['/home']);
  }

  async loginAsGuest(): Promise<void> {
    await signInAnonymously(this.firebaseAuth);
    await this.router.navigate(['/home']);
  }

  async loginWithGoogle(): Promise<void> {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(this.firebaseAuth, provider);
    await this.router.navigate(['/home']);
  }

  logout(): void {
    firebaseSignOut(this.firebaseAuth).catch(() => {});
    this.setCurrentUser(null);
    void this.router.navigate(['/auth']);
  }

  isAuthenticated(): boolean {
    return this.currentUserSignal() !== null;
  }

  private setCurrentUser(user: AuthUser | null): void {
    this.currentUserSignal.set(user);
  }

  private ensureFirebase() {
    if (!getApps().length) {
      initializeApp(firebaseConfig);
    }
    return getAuth();
  }
}
