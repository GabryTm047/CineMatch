import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';

import { PieChartComponent, PieChartSlice } from '../../components/pie-chart/pie-chart.component';
import { QuizService } from '../../services/quiz.service';
import { AppHeaderComponent } from '../../components/app-header/app-header.component';

interface ColumnChartPoint {
  readonly id: string;
  readonly dateLabel: string;
  readonly genreLabel: string;
  readonly valueLabel: string;
  readonly value: number;
  readonly height: string;
  readonly color: string;
  readonly tooltip: string;
}

interface ResultListItem {
  readonly id: string;
  readonly formattedDate: string;
  readonly name: string;
  readonly label: string;
  readonly percentage: number;
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
    const source = this.myResults();
    if (!Array.isArray(source) || !source.length) {
      return [];
    }

    const enriched = source
      .map((result, index) => {
        const createdAt = this.extractDate(result?.createdAt);
        const topEntry = this.extractTopBreakdownEntry(result?.breakdown);
        if (!createdAt || !topEntry) {
          return null;
        }
        const value = this.ensureNumber(topEntry.percentage);
        return {
          id: `${createdAt.getTime()}-${index}`,
          date: createdAt,
          label: topEntry.label,
          color: topEntry.color,
          value
        };
      })
      .filter((entry): entry is { id: string; date: Date; label: string; color: string; value: number } =>
        Boolean(entry)
      )
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    if (!enriched.length) {
      return [];
    }

    const maxValue = enriched.reduce((max, point) => Math.max(max, point.value), 0) || 100;

    return enriched.map(point => {
      const safeValue = Math.max(0, Math.min(point.value, 100));
      const height = Math.max(6, Math.round((safeValue / maxValue) * 100));
      const displayValue = Math.round(safeValue * 10) / 10;
      return {
        id: point.id,
        dateLabel: this.shortDateFormatter.format(point.date),
        genreLabel: point.label,
        valueLabel: `${displayValue}%`,
        value: displayValue,
        height: `${Math.min(100, height)}%`,
        color: point.color,
        tooltip: `${this.fullDateFormatter.format(point.date)} • ${point.label} (${displayValue}%)`
      } satisfies ColumnChartPoint;
    });
  });

  readonly myResultsList = computed<ResultListItem[]>(() => {
    const source = this.myResults();
    if (!Array.isArray(source) || !source.length) {
      return [];
    }
    return source.map((result, index) => {
      const createdAt = this.extractDate(result?.createdAt);
      const topEntry = this.extractTopBreakdownEntry(result?.breakdown);
      return {
        id: this.extractId(result, index),
        formattedDate: createdAt ? this.fullDateFormatter.format(createdAt) : 'N/D',
        name: this.extractName(result),
        label: topEntry?.label ?? 'N/D',
        percentage: Math.round(this.ensureNumber(topEntry?.percentage) * 10) / 10,
        color: topEntry?.color ?? 'var(--color-primary)'
      } satisfies ResultListItem;
    });
  });

  readonly latestResultsList = computed<ResultListItem[]>(() => {
    const source = this.latestResults();
    if (!Array.isArray(source) || !source.length) {
      return [];
    }
    return source.map((result, index) => {
      const createdAt = this.extractDate(result?.createdAt);
      const topEntry = this.extractTopBreakdownEntry(result?.breakdown);
      return {
        id: this.extractId(result, index),
        formattedDate: createdAt ? this.fullDateFormatter.format(createdAt) : 'N/D',
        name: this.extractName(result),
        label: topEntry?.label ?? 'N/D',
        percentage: Math.round(this.ensureNumber(topEntry?.percentage) * 10) / 10,
        color: topEntry?.color ?? 'var(--color-primary)'
      } satisfies ResultListItem;
    });
  });

  readonly globalPieSlices = computed<PieChartSlice[]>(() => {
    const source = this.latestResults();
    if (!Array.isArray(source) || !source.length) {
      return [];
    }

    const totals = new Map<string, { label: string; color: string; value: number }>();

    for (const result of source) {
      const topEntry = this.extractTopBreakdownEntry(result?.breakdown);
      if (!topEntry) {
        continue;
      }
      const key = topEntry.label;
      const current = totals.get(key) ?? { label: topEntry.label, color: topEntry.color, value: 0 };
      current.value += this.ensureNumber(topEntry.percentage) || 0;
      current.color = topEntry.color;
      totals.set(key, current);
    }

    const slices = Array.from(totals.values());
    const totalValue = slices.reduce((sum, slice) => sum + slice.value, 0);
    if (!totalValue) {
      return [];
    }

    return slices
      .map(slice => {
        const percentage = totalValue ? Math.round((slice.value / totalValue) * 1000) / 10 : 0;
        return {
          label: slice.label,
          value: Math.round(slice.value * 10) / 10,
          percentage,
          color: slice.color
        } satisfies PieChartSlice;
      })
      .sort((a, b) => b.value - a.value);
  });

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

  private extractTopBreakdownEntry(breakdown: any): { label: string; color: string; percentage: number } | null {
    if (!Array.isArray(breakdown) || !breakdown.length) {
      return null;
    }
    const ordered = [...breakdown].sort((a, b) => this.ensureNumber(b?.percentage) - this.ensureNumber(a?.percentage));
    const entry = ordered[0];
    const label = this.extractLabel(entry);
    const color = this.extractColor(entry);
    const percentage = this.ensureNumber(entry?.percentage);
    return {
      label,
      color,
      percentage
    };
  }

  private extractLabel(entry: any): string {
    if (typeof entry?.label === 'string' && entry.label.trim().length) {
      return entry.label;
    }
    if (typeof entry?.genre?.label === 'string' && entry.genre.label.trim().length) {
      return entry.genre.label;
    }
    if (typeof entry?.id === 'string') {
      return entry.id;
    }
    return 'N/D';
  }

  private extractColor(entry: any): string {
    if (typeof entry?.color === 'string' && entry.color.trim().length) {
      return entry.color;
    }
    if (typeof entry?.genre?.color === 'string' && entry.genre.color.trim().length) {
      return entry.genre.color;
    }
    return 'var(--color-primary)';
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
}
