import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { PieChartComponent, PieChartSlice } from '../../components/pie-chart/pie-chart.component';
import { QuizBreakdownEntry, QuizService } from '../../services/quiz.service';

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [CommonModule, PieChartComponent],
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.scss']
})
export class ResultsComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly quizService = inject(QuizService);

  readonly result = computed(() => this.quizService.lastResult());
  readonly breakdown = computed<QuizBreakdownEntry[]>(() => this.result()?.breakdown ?? []);
  readonly chartData = computed<PieChartSlice[]>(() =>
    this.breakdown().map((entry: QuizBreakdownEntry) => ({
      label: entry.genre.label,
      value: entry.count,
      percentage: entry.percentage,
      color: entry.genre.color
    }))
  );
  readonly hasResult = computed(() => this.breakdown().length > 0);
  readonly totalAnswers = computed(() => this.result()?.totalAnswers ?? 0);
  readonly topGenre = computed(() => this.breakdown()[0]?.genre ?? null);

  ngOnInit(): void {
    if (!this.hasResult()) {
      void this.router.navigate(['/quiz']);
    }
  }

  repeatQuiz(): void {
    void this.router.navigate(['/quiz']);
  }

  goHome(): void {
    void this.router.navigate(['/home']);
  }

  trackGenre(index: number, entry: QuizBreakdownEntry): string {
    return entry.genre.id;
  }
}
