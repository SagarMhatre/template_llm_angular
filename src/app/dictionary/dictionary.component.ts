import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-dictionary',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './dictionary.component.html',
  styleUrl: './dictionary.component.scss'
})
export class DictionaryComponent {
  protected readonly term = signal('');
  protected readonly message = signal('Enter a word or phrase to look up its meaning.');
  protected readonly maxLength = 30;

  protected updateTerm(event: Event): void {
    const value = (event.target as HTMLInputElement).value?.slice(0, this.maxLength) ?? '';
    this.term.set(value);
  }

  protected submit(): void {
    const value = this.term().trim();
    if (!value) {
      this.message.set('Please provide a word or phrase first.');
      return;
    }

    this.message.set(`Lookup coming soon for “${value}”.`);
  }
}
