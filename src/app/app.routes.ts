import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./planta/terminal/terminal').then(m => m.TerminalComponent)
  }
];
