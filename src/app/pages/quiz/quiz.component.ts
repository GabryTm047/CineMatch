import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { QuizService } from '../../services/quiz.service';
import { QuizQuestion, GenreId, QuizOption } from '../../shared/quiz.interface';
@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.scss']
})
export class QuizComponent {
  private readonly router = inject(Router);
  private readonly quizService = inject(QuizService);

  readonly questions: QuizQuestion[] = this.quizService.startNewSession(10);
  readonly totalQuestions = this.questions.length;

  readonly currentIndex = signal(0);
  private readonly selections = signal<(GenreId | null)[]>(this.questions.map(() => null));
  readonly errorMessage = signal<string | null>(null);

  readonly currentQuestion = computed(() => this.questions[this.currentIndex()]);
  readonly selectedAnswer = computed(() => this.selections()[this.currentIndex()]);
  readonly progressValue = computed(() =>
    Math.round(((this.currentIndex() + 1) / this.totalQuestions) * 100)
  );
  readonly isFirstQuestion = computed(() => this.currentIndex() === 0);
  readonly isLastQuestion = computed(() => this.currentIndex() === this.totalQuestions - 1);

  constructor() {
    this.quizService.clearResults();
  }

  selectOption(option: QuizOption): void {
    this.errorMessage.set(null);
    this.selections.update((current: (GenreId | null)[]) => {
      const updated = [...current];
      updated[this.currentIndex()] = option.genre;
      return updated;
    });
  }

  goNext(): void {
    if (!this.selectedAnswer()) {
      this.errorMessage.set('Seleziona una risposta per continuare.');
      return;
    }

    if (this.isLastQuestion()) {
      this.finishQuiz();
      return;
    }

    this.currentIndex.update((value: number) => value + 1);
  }

  goPrevious(): void {
    if (this.isFirstQuestion()) {
      return;
    }

    this.errorMessage.set(null);
    this.currentIndex.update((value: number) => value - 1);
  }

  private finishQuiz(): void {
    const answers = this.selections();
  if (answers.some((answer: GenreId | null) => answer === null)) {
      this.errorMessage.set('Rispondi a tutte le domande prima di concludere il test.');
      return;
    }

  const normalizedAnswers = answers.map((answer: GenreId | null) => answer as GenreId);
    this.quizService.submitAnswers(normalizedAnswers);
    void this.router.navigate(['/results']);
  }

  trackOption(index: number, option: QuizOption): string {
    return option.label;
  }
}
