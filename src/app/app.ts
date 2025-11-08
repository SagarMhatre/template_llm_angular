import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('angular-llm');
  protected readonly apiKey = signal('');
  protected readonly prompt = signal('');
  protected readonly response = signal('');
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  protected updateApiKey(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.apiKey.set(value);
  }

  protected updatePrompt(event: Event): void {
    const value = (event.target as HTMLTextAreaElement).value;
    this.prompt.set(value);
  }

  protected async sendPrompt(): Promise<void> {
    const text = this.prompt().trim();
    const key = this.apiKey().trim();
    if (!text || !key || this.loading()) {
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.response.set('');

    try {
      const res = await fetch('/api/prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ apiKey: key, prompt: text })
      });

      if (!res.ok) {
        let message = `Request failed (${res.status})`;
        try {
          const body = (await res.json()) as { error?: string };
          if (body?.error) {
            message = body.error;
          }
        } catch {
          // ignore JSON parsing errors
        }
        throw new Error(message);
      }

      const data = (await res.json()) as { response?: string };
      this.response.set(data.response ?? '(no response returned)');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unknown error contacting OpenAI.';
      this.error.set(message);
    } finally {
      this.loading.set(false);
    }
  }
}
