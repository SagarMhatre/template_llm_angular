import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { PromptStateService } from '../prompt-state.service';

@Component({
  selector: 'app-prompt-play',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './prompt-play.component.html',
  styleUrl: './prompt-play.component.scss'
})
export class PromptPlayComponent {
  constructor(protected readonly promptState: PromptStateService) {}

  protected handlePromptInput(event: Event): void {
    const value = (event.target as HTMLTextAreaElement).value;
    this.promptState.setPrompt(value);
  }

  protected async sendPrompt(): Promise<void> {
    await this.promptState.sendPrompt();
  }
}
