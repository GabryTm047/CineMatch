import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

export interface AuthUser {
  readonly name: string;
  readonly email: string;
  readonly isGuest: boolean;
}

interface StoredUser {
  readonly name: string;
  readonly email: string;
  readonly password: string;
}

const USERS_STORAGE_KEY = 'cinematch_users';
const SESSION_STORAGE_KEY = 'cinematch_session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly router = inject(Router);
  private readonly users = signal<StoredUser[]>(this.loadStoredUsers());
  private readonly currentUserSignal = signal<AuthUser | null>(this.loadStoredSession());

  readonly currentUser = computed(() => this.currentUserSignal());
  readonly isLoggedIn = computed(() => this.currentUserSignal() !== null);

  register(name: string, email: string, password: string): void {
    const normalizedEmail = email.trim().toLowerCase();
    if (!name.trim() || !password.trim()) {
      throw new Error('Per registrarti compila tutti i campi richiesti.');
    }

  const alreadyExists = this.users().some((user: StoredUser) => user.email === normalizedEmail);
    if (alreadyExists) {
      throw new Error('Esiste già un account con questa email.');
    }

    const persistedUser: StoredUser = {
      name: name.trim(),
      email: normalizedEmail,
      password: password.trim()
    };

  this.users.update((list: StoredUser[]) => {
      const updated = [...list, persistedUser];
      this.persistUsers(updated);
      return updated;
    });

    this.setCurrentUser({ name: persistedUser.name, email: persistedUser.email, isGuest: false });
  }

  login(email: string, password: string): void {
    const normalizedEmail = email.trim().toLowerCase();
  const credential = this.users().find((user: StoredUser) => user.email === normalizedEmail);

    if (!credential || credential.password !== password.trim()) {
      throw new Error('Credenziali non valide. Controlla email e password.');
    }

    this.setCurrentUser({ name: credential.name, email: credential.email, isGuest: false });
  }

  loginAsGuest(): void {
    const guestId = Math.floor(Math.random() * 10_000);
    this.setCurrentUser({
      name: `Ospite ${guestId.toString().padStart(4, '0')}`,
      email: `ospite.${guestId}@cinematch.app`,
      isGuest: true
    });
  }

  logout(): void {
    this.setCurrentUser(null);
    void this.router.navigate(['/auth']);
  }

  isAuthenticated(): boolean {
    return this.currentUserSignal() !== null;
  }

  private setCurrentUser(user: AuthUser | null): void {
    this.currentUserSignal.set(user);
    this.persistSession(user);
  }

  private loadStoredUsers(): StoredUser[] {
    if (!this.canUseStorage()) {
      return [];
    }

    try {
      const raw = localStorage.getItem(USERS_STORAGE_KEY);
      if (!raw) {
        return [];
      }
      const parsed = JSON.parse(raw) as StoredUser[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private loadStoredSession(): AuthUser | null {
    if (!this.canUseStorage()) {
      return null;
    }

    try {
      const raw = localStorage.getItem(SESSION_STORAGE_KEY);
      if (!raw) {
        return null;
      }
      const parsed = JSON.parse(raw) as AuthUser;
      if (parsed && typeof parsed.email === 'string') {
        return parsed;
      }
    } catch {
      // ignore corrupted session
    }

    return null;
  }

  private persistUsers(users: StoredUser[]): void {
    if (!this.canUseStorage()) {
      return;
    }

    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }

  private persistSession(user: AuthUser | null): void {
    if (!this.canUseStorage()) {
      return;
    }

    if (user) {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }

  private canUseStorage(): boolean {
    return typeof window !== 'undefined' && !!window.localStorage;
  }
}
