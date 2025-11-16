import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './app-header.component.html',
  styleUrls: ['./app-header.component.scss']
})
export class AppHeaderComponent {
  private readonly authService = inject(AuthService);

  readonly user = computed(() => this.authService.currentUser());

  readonly displayName = computed(() => {
    const name = this.user()?.name?.trim();
    return name && name.length ? name : 'Cinefilo';
  });

  readonly avatarUrl = computed(() => {
    const url = this.user()?.photoUrl?.trim();
    return url && url.length ? url : null;
  });

  readonly initials = computed(() => {
    const name = this.displayName();
    if (!name.length) {
      return '?';
    }
    const [firstWord] = name.split(/\s+/);
    return firstWord.charAt(0).toUpperCase();
  });

  logout(): void {
    this.authService.logout();
  }
}
