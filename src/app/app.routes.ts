import { Routes } from '@angular/router';
import { DictionaryComponent } from './dictionary/dictionary.component';
import { HomeComponent } from './home/home.component';
import { PromptPlayComponent } from './prompt-play/prompt-play.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'dictionary',
    component: DictionaryComponent
  },
  {
    path: 'prompt-play',
    component: PromptPlayComponent
  },
  {
    path: '**',
    redirectTo: ''
  }
];
