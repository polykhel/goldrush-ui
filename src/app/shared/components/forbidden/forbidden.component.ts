import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-forbidden',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-100">
      <div class="text-center">
        <h1 class="text-9xl font-bold text-red-500">403</h1>
        <h2 class="text-4xl font-semibold text-gray-800 mt-4">Access Forbidden</h2>
        <p class="text-gray-600 mt-4 mb-8">Sorry, you don't have permission to access this page.</p>
        <a routerLink="/" class="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-300">
          Back to Home
        </a>
      </div>
    </div>
  `
})
export class ForbiddenComponent {}