import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { OpenAIService } from '../openai.service';
import { PromptStateService } from '../prompt-state.service';

@Component({
  selector: 'app-dictionary',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './dictionary.component.html',
  styleUrl: './dictionary.component.scss'
})
export class DictionaryComponent {
  protected readonly term = signal('');
  protected readonly explanation = signal('');
  protected readonly examples = signal('');
  protected readonly info = signal('Enter a word or phrase to look up its meaning.');
  protected readonly error = signal<string | null>(null);
  protected readonly loading = signal(false);
  protected readonly maxLength = 30;

  constructor(
    protected readonly promptState: PromptStateService,
    private readonly openAI: OpenAIService
  ) {}

  protected updateTerm(event: Event): void {
    const value = (event.target as HTMLInputElement).value?.slice(0, this.maxLength) ?? '';
    this.term.set(value);
  }

  protected async submit(): Promise<void> {
    const value = this.term().trim();
    if (!value) {
      this.info.set('Please provide a word or phrase first.');
      return;
    }

    const apiKey = this.promptState.apiKey().trim();
    if (!apiKey) {
      this.error.set('Add your OpenAI API key in Settings before using the dictionary.');
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.info.set(`Looking up “${value}”…`);
    this.explanation.set('');
    this.examples.set('');

    const prompt = `For the phrase "${value}" respond in the below format for a 7 yr old kid:
- Explanation : A short and simple explanation in English (1–2 sentences, using age-appropriate vocabulary).
- Examples : 2 example sentences in English showing how the word or phrase can be used.`;

    try {
      const content = await this.openAI.complete(apiKey, this.promptState.selectedModel(), [
        { role: 'user', content: prompt }
      ]);
      this.parseResponse(content);
      this.info.set('Here is a kid-friendly explanation and examples:');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unknown error retrieving explanation.';
      this.error.set(message);
      this.info.set('Unable to fetch details right now.');
    } finally {
      this.loading.set(false);
    }
  }

  private parseResponse(content: string): void {
    if (!content) {
      this.explanation.set('(no explanation returned)');
      this.examples.set('');
      return;
    }

    const explanationMatch = content.match(/Explanation\s*:?(.+?)(?:Examples|$)/is);
    const examplesMatch = content.match(/Examples\s*:?([\s\S]+)/i);

    this.explanation.set(explanationMatch?.[1]?.trim() ?? content.trim());
    this.examples.set(examplesMatch?.[1]?.trim() ?? '');
  }
}
