import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { AppHeaderComponent } from '../../components/app-header/app-header.component';

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

  readonly user = computed(() => this.authService.currentUser());

  startQuiz(): void {
    void this.router.navigate(['/quiz']);
  }

  goToStatistics(): void {
    void this.router.navigate(['/statistics']);
  }
}
