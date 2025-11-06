import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly isRegisterMode = signal(false);

  // Validator method needs to be defined before it's referenced by form initialization
  private passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value as string | null;
    const confirm = control.get('confirmPassword')?.value as string | null;
    if (password && confirm && password !== confirm) {
      return { mismatch: true };
    }
    return null;
  }

  readonly loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  readonly registerForm = this.fb.nonNullable.group(
    {
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    },
  { validators: (control: AbstractControl) => this.passwordsMatchValidator(control) }
  );

  readonly registerControls = this.registerForm.controls;
  readonly loginControls = this.loginForm.controls;

  get registerMode(): boolean {
    return this.isRegisterMode();
  }

  readonly activeForm = computed(() =>
    this.isRegisterMode() ? this.registerForm : this.loginForm
  );

  readonly errorMessage = signal<string | null>(null);
  readonly infoMessage = signal<string | null>(null);

  toggleMode(): void {
  this.isRegisterMode.update((value: boolean) => !value);
    this.errorMessage.set(null);
    this.infoMessage.set(null);
    this.loginForm.reset();
    this.registerForm.reset();
  }

  submit(): void {
    const form = this.activeForm();
    if (form.invalid) {
      form.markAllAsTouched();
      this.errorMessage.set('Controlla i campi evidenziati prima di continuare.');
      return;
    }

    this.errorMessage.set(null);

    if (this.isRegisterMode()) {
      const { name, email, password } = this.registerForm.getRawValue();
      try {
        this.authService.register(name, email, password);
        this.infoMessage.set('Registrazione completata! Benvenuto su CineMatch.');
        void this.router.navigate(['/home']);
      } catch (error) {
        this.errorMessage.set(error instanceof Error ? error.message : 'Registrazione non riuscita.');
      }
      return;
    }

    const { email, password } = this.loginForm.getRawValue();
    try {
      this.authService.login(email, password);
      this.infoMessage.set('Bentornato!');
      void this.router.navigate(['/home']);
    } catch (error) {
      this.errorMessage.set(error instanceof Error ? error.message : 'Accesso non riuscito.');
    }
  }

  continueAsGuest(): void {
    this.authService.loginAsGuest();
    this.infoMessage.set('Accesso come ospite attivato.');
    void this.router.navigate(['/home']);
  }
}
