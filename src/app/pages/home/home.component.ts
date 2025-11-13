import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { QuizService } from '../../services/quiz.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly quizService = inject(QuizService);

  readonly user = computed(() => this.authService.currentUser());

  readonly myResults = signal<any[]>([]);
  readonly latestResults = signal<any[]>([]);

  async ngOnInit(): Promise<void> {
    this.myResults.set(await this.quizService.getMyLatestResults(10));
    this.latestResults.set(await this.quizService.getLatestResults(10));
  }

  startQuiz(): void {
    void this.router.navigate(['/quiz']);
  }

  logout(): void {
    this.authService.logout();
  }
}
