import { Component } from '@angular/core';


@Component({
  selector: 'app-page-loader',
  standalone: true,
  imports: [],
  template: `
    <div class="loader-container">
      <div class="loader">
        <div class="loader-circle"></div>
      </div>
    </div>
  `,
  styles: [`
    .loader-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: rgba(255, 255, 255, 0.9);
      z-index: 9999;
    }

    .loader {
      width: 50px;
      height: 50px;
      position: relative;
    }

    .loader-circle {
      width: 100%;
      height: 100%;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #3498db;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
})
export class PageLoaderComponent {}