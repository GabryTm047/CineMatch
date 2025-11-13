import { computed, Injectable, signal, inject } from '@angular/core';
import {
  GenreId,
  GenreInfo,
  QuizBreakdownEntry,
  QuizQuestion,
  QuizResult,
  QUESTIONS,
  GENRES,
} from '../shared/quiz.interface';
import { AuthService } from './auth.service';
import { getApps, initializeApp } from 'firebase/app';
import { getFirestore, addDoc, collection, serverTimestamp, query, where, orderBy, limit, getDocs, Firestore } from 'firebase/firestore';
import { firebaseConfig } from '../../firebase.config';

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
    void this.saveResultToFirestore(result);
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

  private async saveResultToFirestore(result: QuizResult): Promise<void> {
    try {
      const user = this.auth.currentUser();
      const docData = {
        uid: user?.email ?? 'guest',
        name: user?.name ?? 'Utente',
        email: user?.email ?? null,
        isGuest: user?.isGuest ?? true,
        totalAnswers: result.totalAnswers,
        answers: result.answers,
        breakdown: result.breakdown.map(e => ({
          id: e.genre.id,
          label: e.genre.label,
          color: e.genre.color,
          count: e.count,
          percentage: e.percentage,
        })),
        createdAt: serverTimestamp(),
      } as const;
      await addDoc(collection(this.firestore, 'quizResults'), docData);
    } catch {
      // ignore persistence errors for UX flow
    }
  }

  async getMyLatestResults(max: number = 10): Promise<any[]> {
    const user = this.auth.currentUser();
    if (!user?.email) return [];
    const q = query(
      collection(this.firestore, 'quizResults'),
      where('email', '==', user.email),
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
