import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { PieChartComponent, PieChartSlice } from '../../components/pie-chart/pie-chart.component';
import { QuizService } from '../../services/quiz.service';
import { AppHeaderComponent } from '../../components/app-header/app-header.component';
import { GENRES } from '../../shared/genre.interface';

interface ColumnChartPoint {
  readonly id: string;
  readonly dateLabel: string;
  readonly genreLabel: string;
  readonly color: string;
  readonly tooltip: string;
}

interface ResultListItem {
  readonly id: string;
  readonly formattedDate: string;
  readonly name: string;
  readonly genreLabel: string;
  readonly color: string;
}

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule, PieChartComponent, AppHeaderComponent],
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss']
})
export class StatisticsComponent implements OnInit {
  private readonly quizService = inject(QuizService);

  private readonly shortDateFormatter = new Intl.DateTimeFormat('it-IT', {
    day: '2-digit',
    month: '2-digit'
  });
  private readonly fullDateFormatter = new Intl.DateTimeFormat('it-IT', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  readonly loading = signal<boolean>(true);
  readonly error = signal<string | null>(null);

  readonly myResults = signal<any[]>([]);
  readonly latestResults = signal<any[]>([]);

  readonly personalChartPoints = computed<ColumnChartPoint[]>(() => {
    const source = this.dedupeResults(this.myResults());
    if (!Array.isArray(source) || !source.length) return [];
    return source
      .map((result, index) => {
        const createdAt = this.extractDate(result?.createdAt);
        const top = this.extractTopGenre(result);
        if (!createdAt || !top) return null;
        return {
          id: `${createdAt.getTime()}-${index}`,
          date: createdAt,
          genre: top
        };
      })
      .filter((e): e is { id: string; date: Date; genre: { id: string; label: string; color: string } } => Boolean(e))
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .map(entry => ({
        id: entry.id,
        dateLabel: this.shortDateFormatter.format(entry.date),
        genreLabel: entry.genre.label,
        color: entry.genre.color,
        tooltip: this.fullDateFormatter.format(entry.date) + ' • ' + entry.genre.label
      }));
  });

  readonly myResultsList = computed<ResultListItem[]>(() => {
    const source = this.dedupeResults(this.myResults());
    if (!Array.isArray(source) || !source.length) return [];
    const seen = new Set<string>();
    return source.reduce<ResultListItem[]>((acc, result, index) => {
      const createdAt = this.extractDate(result?.createdAt);
      const top = this.extractTopGenre(result);
      const item: ResultListItem = {
        id: this.extractId(result, index),
        formattedDate: createdAt ? this.fullDateFormatter.format(createdAt) : 'N/D',
        name: this.extractName(result),
        genreLabel: top?.label ?? 'N/D',
        color: top?.color ?? 'var(--color-primary)'
      } satisfies ResultListItem;
      const key = `${item.formattedDate}|${item.name}|${item.genreLabel}`;
      if (seen.has(key)) {
        return acc;
      }
      seen.add(key);
      acc.push(item);
      return acc;
    }, []);
  });

  readonly latestResultsList = computed<ResultListItem[]>(() => {
    const source = this.uniqueLatestByUser(this.latestResults());
    if (!Array.isArray(source) || !source.length) return [];
    const seen = new Set<string>();
    return source.reduce<ResultListItem[]>((acc, result, index) => {
      const createdAt = this.extractDate(result?.createdAt);
      const top = this.extractTopGenre(result);
      const item: ResultListItem = {
        id: this.extractId(result, index),
        formattedDate: createdAt ? this.fullDateFormatter.format(createdAt) : 'N/D',
        name: this.extractName(result),
        genreLabel: top?.label ?? 'N/D',
        color: top?.color ?? 'var(--color-primary)'
      };
      const key = `${item.formattedDate}|${item.name}|${item.genreLabel}`;
      if (seen.has(key)) {
        return acc;
      }
      seen.add(key);
      acc.push(item);
      return acc;
    }, []);
  });

  readonly globalPieSlices = computed<PieChartSlice[]>(() => {
    const source = this.uniqueLatestByUser(this.latestResults());
    if (!Array.isArray(source) || !source.length) return [];
    const counts = new Map<string, number>();
    for (const r of source) {
      const top = this.extractTopGenre(r);
      if (!top) continue;
      counts.set(top.id, (counts.get(top.id) ?? 0) + 1);
    }
    const total = Array.from(counts.values()).reduce((a, b) => a + b, 0);
    if (!total) return [];
    return Array.from(counts.entries())
      .map(([id, value]) => {
        const info = this.lookupGenre(id);
        const percentage = Math.round((value / total) * 1000) / 10;
        return {
          label: info.label,
          value,
          percentage,
          color: info.color
        } satisfies PieChartSlice;
      })
      .sort((a, b) => b.value - a.value);
  });

  readonly latestSummary = computed(() => {
    const source = this.uniqueLatestByUser(this.latestResults());
    if (!Array.isArray(source) || !source.length) {
      return { total: 0, guests: 0, registered: 0 } as const;
    }
    let guests = 0;
    let registered = 0;
    for (const r of source) {
      if (r?.isGuest) {
        guests++;
      } else {
        registered++;
      }
    }
    return { total: guests + registered, guests, registered } as const;
  });

  readonly filteredResultsSummary = computed(() => {
    const source = this.uniqueLatestByUser(this.latestResults());
    if (!Array.isArray(source) || !source.length) {
      return { guests: 0, registered: 0 } as const;
    }

    let guests = 0;
    let registered = 0;

    for (const result of source) {
      if (result?.isGuest) {
        guests++;
      } else {
        registered++;
      }
    }

    return { guests, registered } as const;
  });

  private uniqueLatestByUser(results: any[]): any[] {
    if (!Array.isArray(results) || !results.length) return [];

    const latestMap = new Map<string, any>();

    for (const result of results) {
      const uid = result?.uid;
      const createdAt = this.extractDate(result?.createdAt)?.getTime() ?? 0;

      if (!uid) continue;

      const existing = latestMap.get(uid);
      const existingDate = existing ? this.extractDate(existing?.createdAt)?.getTime() ?? 0 : -1;

      if (!existing || createdAt > existingDate) {
        latestMap.set(uid, result);
      }
    }

    return Array.from(latestMap.values()).sort((a, b) => {
      const dateA = this.extractDate(a?.createdAt)?.getTime() ?? 0;
      const dateB = this.extractDate(b?.createdAt)?.getTime() ?? 0;
      return dateB - dateA;
    });
  }

  async ngOnInit(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const [mine, global] = await Promise.all([
        this.quizService.getMyLatestResults(14),
        this.quizService.getLatestResults(24)
      ]);
      this.myResults.set(mine ?? []);
      this.latestResults.set(global ?? []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Impossibile caricare le statistiche.';
      this.error.set(message);
    } finally {
      this.loading.set(false);
    }
  }

  trackColumn(_index: number, point: ColumnChartPoint): string {
    return point.id;
  }

  private extractId(result: any, index: number): string {
    if (result?.id && typeof result.id === 'string') {
      return result.id;
    }
    const createdAt = this.extractDate(result?.createdAt);
    return `${createdAt ? createdAt.getTime() : 'unknown'}-${index}`;
  }

  private extractName(result: any): string {
    if (typeof result?.name === 'string' && result.name.trim().length) {
      return result.name;
    }
    if (typeof result?.email === 'string' && result.email.trim().length) {
      return result.email;
    }
    return 'Utente';
  }

  private extractTopGenre(result: any): { id: string; label: string; color: string } | null {
    if (typeof result?.topGenre === 'string' && result.topGenre.trim().length) {
      return this.lookupGenre(result.topGenre);
    }
    if (Array.isArray(result?.breakdown) && result.breakdown.length) {
      const ordered = [...result.breakdown].sort(
        (a, b) => this.ensureNumber(b?.percentage) - this.ensureNumber(a?.percentage)
      );
      const entry = ordered[0];
      const id = entry?.id || entry?.genre?.id;
      if (typeof id !== 'string') return null;
      return this.lookupGenre(id);
    }
    return null;
  }

  private lookupGenre(id: string): { id: string; label: string; color: string } {
    const found = GENRES.find(g => g.id === id);
    if (found) {
      return { id: found.id, label: found.label, color: found.color };
    }
    return { id, label: id, color: 'var(--color-primary)' };
  }

  private extractDate(input: unknown): Date | null {
    if (!input) {
      return null;
    }
    if (input instanceof Date) {
      return isNaN(input.getTime()) ? null : input;
    }
    if (typeof input === 'string') {
      const parsed = new Date(input);
      return isNaN(parsed.getTime()) ? null : parsed;
    }
    if (typeof (input as any)?.toDate === 'function') {
      const date = (input as any).toDate();
      return date instanceof Date && !isNaN(date.getTime()) ? date : null;
    }
    if (typeof (input as any)?.seconds === 'number') {
      const millis = (input as any).seconds * 1000 + Math.floor(((input as any).nanoseconds ?? 0) / 1_000_000);
      const date = new Date(millis);
      return isNaN(date.getTime()) ? null : date;
    }
    return null;
  }

  private ensureNumber(value: unknown): number {
    const numeric = typeof value === 'number' && !Number.isNaN(value) ? value : Number(value);
    if (Number.isFinite(numeric)) {
      return numeric;
    }
    return 0;
  }

  private dedupeResults(results: any[]): any[] {
    if (!Array.isArray(results) || !results.length) {
      return [];
    }
    const seen = new Set<string>();
    const unique: any[] = [];
    for (const r of results) {
      const createdAt = this.extractDate(r?.createdAt);
      const top = this.extractTopGenre(r);
      const keyParts = [
        r?.uid ?? 'unknown',
        createdAt ? createdAt.getTime() : 'no-date',
        top?.id ?? 'no-id'
      ];
      const key = keyParts.join('|');
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      unique.push(r);
    }
    return unique;
  }
}
