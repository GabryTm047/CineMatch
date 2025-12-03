import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { AppHeaderComponent } from '../../components/app-header/app-header.component';
import { FilmService } from '../../services/film.service';
import { FilmResponse } from '../../shared/film.interface';
import { QuizService } from '../../services/quiz.service';
import { GENRES } from '../../shared/genre.interface';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, AppHeaderComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly filmService = inject(FilmService);
  private readonly quizService = inject(QuizService);

  readonly user = computed(() => this.authService.currentUser());
  readonly movies = signal<FilmResponse | null>(null);
  readonly movieItems = signal<Array<FilmResponse['results'][number]>>([]);
  readonly currentIndex = signal<number>(0);
  readonly currentMovie = computed(() => {
    const items = this.movieItems();
    const idx = this.currentIndex();
    return items[idx] ?? null;
  });
  readonly selectedGenreId = signal<number | null>(null);
  readonly dots = computed<number[]>(() => Array.from({ length: 20 }, (_, i) => i));

  constructor() {
    void this.initMovies();
  }

  private async initMovies(): Promise<void> {
    const preferredGenreId = await this.resolvePreferredGenreId();
    const genreId = preferredGenreId ?? this.filmService.genreId;
    this.selectedGenreId.set(genreId);
    this.filmService.getMoviesByGenre(genreId, this.filmService.page).subscribe({
      next: (resp) => {
        this.movies.set(resp);
        this.movieItems.set(resp.results ?? []);
        this.currentIndex.set(0);
      },
      error: () => this.movies.set({ page: 1, results: [], total_pages: 0, total_results: 0 }),
    });
  }

  private async resolvePreferredGenreId(): Promise<number | null> {
    const lastLocal = this.quizService.lastResult();
    if (lastLocal && lastLocal.breakdown?.length) {
      const top = lastLocal.breakdown[0]?.genre;
      if (top?.genreId) return top.genreId;
    }

    try {
      const mine = await this.quizService.getMyLatestResults(3);
      const myTop = this.extractTopGenreId(mine?.[0]);
      if (myTop !== null) return myTop;
    } catch {}

    try {
      const latest = await this.quizService.getLatestResults(50);
      const counts = new Map<string, number>();
      for (const r of latest ?? []) {
        const id = this.extractTopGenreKey(r);
        if (!id) continue;
        counts.set(id, (counts.get(id) ?? 0) + 1);
      }
      if (counts.size) {
        let bestKey: string | null = null;
        let bestCount = -1;
        for (const [k, v] of counts.entries()) {
          if (v > bestCount) {
            bestKey = k;
            bestCount = v;
          }
        }
        if (bestKey) {
          const matched = GENRES.find(g => g.id === bestKey);
          return matched?.genreId ?? null;
        }
      }
    } catch {}

    return null;
  }

  private extractTopGenreId(result: any): number | null {
    const key = this.extractTopGenreKey(result);
    if (!key) return null;
    const found = GENRES.find(g => g.id === key);
    return found?.genreId ?? null;
  }

  private extractTopGenreKey(result: any): string | null {
    if (typeof result?.topGenre === 'string' && result.topGenre.trim().length) {
      return result.topGenre;
    }
    if (Array.isArray(result?.breakdown) && result.breakdown.length) {
      const ordered = [...result.breakdown].sort((a, b) => Number(b?.percentage ?? 0) - Number(a?.percentage ?? 0));
      const entry = ordered[0];
      const id = entry?.id || entry?.genre?.id;
      return typeof id === 'string' ? id : null;
    }
    return null;
  }

  startQuiz(): void {
    void this.router.navigate(['/quiz']);
  }

  goToStatistics(): void {
    void this.router.navigate(['/statistics']);
  }

  nextSlide(): void {
    const items = this.movieItems();
    if (!items.length) return;
    const idx = this.currentIndex() + 1;
    if (idx < items.length) {
      this.currentIndex.set(idx);
      // If we are at last item, proactively load next page
      if (idx === items.length - 1) {
        this.loadNextPage();
      }
    } else {
      // Already at end, try loading next page
      this.loadNextPage();
    }
  }

  prevSlide(): void {
    const idx = this.currentIndex() - 1;
    this.currentIndex.set(Math.max(0, idx));
  }

  private loadNextPage(): void {
    const last = this.movies();
    if (!last) return;
    const preferredPage = (last.page ?? this.filmService.page) + 1;
    const genreId = this.selectedGenreId() ?? this.filmService.genreId;
    this.filmService.getMoviesByGenre(genreId, preferredPage).subscribe({
      next: (resp) => {
        // update internal page state
        this.filmService.page = resp.page ?? preferredPage;
        this.movies.set(resp);
        const merged = [...this.movieItems(), ...(resp.results ?? [])];
        this.movieItems.set(merged);
      },
      error: () => void 0,
    });
  }

  goToStart(): void {
    const genreId = this.selectedGenreId() ?? this.filmService.genreId;
    this.filmService.page = 1;
    this.filmService.getMoviesByGenre(genreId, 1).subscribe({
      next: (resp) => {
        this.movies.set(resp);
        this.movieItems.set(resp.results ?? []);
        this.currentIndex.set(0);
      },
      error: () => void 0,
    });
  }
}
