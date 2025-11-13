import { computed, Injectable, signal } from '@angular/core';
import {
  GenreId,
  GenreInfo,
  QuizBreakdownEntry,
  QuizResult,
  QUESTIONS,
  GENRES,
} from '../shared/quiz.interface';

@Injectable({ providedIn: `root` })
export class QuizService {
  readonly questions = QUESTIONS;
  readonly genres = GENRES;

  private readonly lastResultSignal = signal<QuizResult | null>(null);
  readonly lastResult = computed(() => this.lastResultSignal());

  submitAnswers(answers: GenreId[]): QuizResult {
    if (answers.length !== this.questions.length) {
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
}
