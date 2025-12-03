import { computed, Injectable, signal, inject } from '@angular/core';
import {
  QuizBreakdownEntry,
  QuizQuestion,
  QuizResult,
  QUESTIONS,
} from '../shared/quiz.interface';
import { AuthService } from './auth.service';
import { getApps, initializeApp } from 'firebase/app';
import { getFirestore, collection, serverTimestamp, query, where, orderBy, limit, getDocs, Firestore, doc, setDoc } from 'firebase/firestore';
import { firebaseConfig } from '../../firebase.config';
import { GENRES, GenreId, GenreInfo } from '../shared/genre.interface';

@Injectable({ providedIn: `root` })
export class QuizService {
  private readonly auth = inject(AuthService);
  private firestore: Firestore = this.ensureFirestore();

  private currentQuestions: QuizQuestion[] = QUESTIONS;

  startNewSession(count: number = 10): QuizQuestion[] {
    const n = Math.min(count, QUESTIONS.length);
    const shuffled = [...QUESTIONS];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    this.currentQuestions = shuffled.slice(0, n);
    return this.currentQuestions;
  }
  readonly genres = GENRES;

  private readonly lastResultSignal = signal<QuizResult | null>(null);
  readonly lastResult = computed(() => this.lastResultSignal());

  submitAnswers(answers: GenreId[]): QuizResult {
    if (answers.length !== this.currentQuestions.length) {
      throw new Error(`Rispondi a tutte le domande prima di proseguire.`);
    }

    const counts = new Map<GenreId, number>();
    for (const genre of answers) {
      const current = counts.get(genre) ?? 0;
      counts.set(genre, current + 1);
    }

    const total = answers.length;
    const breakdown = GENRES
      .map((info: GenreInfo) => {
        const count = counts.get(info.id) ?? 0;
        const percentage = total > 0 ? Math.round((count / total) * 1000) / 10 : 0;
        return { genre: info, count, percentage } satisfies QuizBreakdownEntry;
      })
      .filter(entry => entry.count > 0)
      .sort((a, b) => b.percentage - a.percentage);

    const result: QuizResult = { answers: [...answers], breakdown, totalAnswers: total };
    this.lastResultSignal.set(result);
    return result; 
  }

  getGenreInfo(id: GenreId): GenreInfo {
    const found = GENRES.find(genre => genre.id === id);
    if (!found) {
      throw new Error(`Genere non riconosciuto: ${id}`);
    }
    return found;
  }

  clearResults(): void {
    this.lastResultSignal.set(null);
  }

  private ensureFirestore(): Firestore {
    if (!getApps().length) {
      initializeApp(firebaseConfig);
    }
    return getFirestore();
  }

 
  async submitAnswersWithRecaptcha(answers: GenreId[], recaptchaToken: string): Promise<QuizResult> {
    const result = this.submitAnswers(answers);
    const user = this.auth.currentUser();
    const top = result.breakdown[0];
    const payload = {
      token: recaptchaToken,
      uid: user?.uid ?? 'anonymous',
      topGenre: top?.genre.id ?? 'unknown',
      createAt: Date.now(),
      isGuest: user?.isGuest ?? false,
      name: user?.name ?? 'Utente'
    } as const;
    try {
      const resp = await fetch('https://europe-west1-cinematch-gc.cloudfunctions.net/verifyRecaptchaV3AndSaveQuiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!resp.ok) {
        throw new Error(`Verifica reCAPTCHA fallita (${resp.status})`);
      }
      const data = await resp.json();
      if (!data.success) {
        throw new Error(data.error || 'Verifica non riuscita');
      }
      return result;
    } catch (err) {
      this.lastResultSignal.set(null);
      throw err;
    }
  }

   async savePreferencesForUser(result: QuizResult): Promise<void> {
    const user = this.auth.currentUser();
    if (!user?.uid) return;
    try {
      const prefRef = doc(this.firestore, 'users', user.uid, 'preferences', 'current');
      const topGenres = result.breakdown.slice(0, 5).map(e => ({
        id: e.genre.id,
        label: e.genre.label,
        percentage: e.percentage,
        color: e.genre.color,
        count: e.count,
      }));
      const prefData = {
        uid: user.uid,
        name: user.name,
        isGuest: user.isGuest,
        totalAnswers: result.totalAnswers,
        topGenres,
        breakdown: topGenres, // store light breakdown (top 5)
        updatedAt: serverTimestamp(),
      } as const;
      await setDoc(prefRef, prefData, { merge: true });
    } catch {
      // ignore preference write errors silently
    }
  }

  async getMyLatestResults(max: number = 10): Promise<any[]> {
    const user = this.auth.currentUser();
    if (!user?.uid) return [];
    const q = query(
      collection(this.firestore, 'quizResults'),
      where('uid', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(max)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }

  async getLatestResults(max: number = 10): Promise<any[]> {
    const q = query(
      collection(this.firestore, 'quizResults'),
      orderBy('createdAt', 'desc'),
      limit(max)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }
}
