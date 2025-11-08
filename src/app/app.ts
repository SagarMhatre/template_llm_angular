import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { SettingsComponent } from './settings/settings.component';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    SettingsComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('angular-llm');
  protected readonly apiKey = signal('');
  protected readonly prompt = signal('');
  protected readonly response = signal('');
  protected readonly selectedModel = signal('gpt-4o-mini');
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly showSettings = signal(false);

  protected readonly availableModels = [
    { value: 'gpt-4o-mini', label: 'GPT-4o Mini (cheap, fast)' },
    { value: 'gpt-4o', label: 'GPT-4o (balanced)' },
    { value: 'gpt-4.1-mini', label: 'GPT-4.1 Mini' },
    { value: 'gpt-4.1', label: 'GPT-4.1' }
  ];

  protected updatePrompt(event: Event): void {
    const value = (event.target as HTMLTextAreaElement).value;
    this.prompt.set(value);
  }

  protected setApiKey(value: string): void {
    this.apiKey.set(value);
  }

  protected updateModel(value: string): void {
    this.selectedModel.set(value);
  }

  protected toggleSettings(force?: boolean): void {
    this.showSettings.set(force ?? !this.showSettings());
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
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${key}`
        },
        body: JSON.stringify({
          model: this.selectedModel(),
          messages: [{ role: 'user', content: text }]
        })
      });

      if (!response.ok) {
        let message = `Request failed (${response.status})`;
        try {
          const body = (await response.json()) as { error?: { message?: string } };
          if (body?.error?.message) {
            message = body.error.message;
          }
        } catch {
          // ignore JSON parse errors
        }
        throw new Error(message);
      }

      const data = (await response.json()) as {
        choices?: Array<{ message?: { content?: string | Array<{ text?: string }> } }>;
      };

      const choice = data.choices?.[0];
      const message = choice?.message?.content;
      let result = '';

      if (typeof message === 'string') {
        result = message;
      } else if (Array.isArray(message)) {
        result = message
          .map((segment) => segment?.text ?? '')
          .filter(Boolean)
          .join('\n');
      } else {
        result = '(No text returned from OpenAI)';
      }

      this.response.set(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error contacting OpenAI.';
      this.error.set(message);
    } finally {
      this.loading.set(false);
    }
  }
}
