import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  template: `
    <header class="app-header">
      <div class="logo">📘 Quiz Admin</div>
      <input type="checkbox" id="menu-toggle" class="menu-toggle">
      <label for="menu-toggle" class="hamburger">&#9776;</label>
      <nav class="nav-links">
        <a routerLink="/single-quiz" routerLinkActive="active" (click)="closeMenu()">Single Quiz</a>
        <a routerLink="/popular-quiz" routerLinkActive="active" (click)="closeMenu()">Popular Quiz Set</a>
      </nav>
    </header>

    <main class="app-main">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    /* Header */
    .app-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 24px;
      background: #1976d2;
      color: #fff;
      box-shadow: 0 2px 6px rgba(0,0,0,0.15);
      position: relative;
    }

    .logo {
      font-weight: bold;
      font-size: 18px;
    }

    /* Nav links */
    .nav-links {
      display: flex;
      gap: 16px;
    }

    .nav-links a {
      color: #fff;
      text-decoration: none;
      font-weight: 500;
      padding: 6px 12px;
      border-radius: 4px;
      transition: background 0.3s;
    }

    .nav-links a:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    .nav-links a.active {
      background: rgba(255, 255, 255, 0.3);
    }

    /* Hamburger */
    .hamburger {
      display: none;
      font-size: 28px;
      cursor: pointer;
      z-index: 101; /* above nav */
    }

    .menu-toggle {
      display: none;
    }

    /* Mobile styles */
    @media (max-width: 768px) {
      .nav-links {
        position: fixed;
        top: 0;
        right: -100%;
        height: 100%;
        width: 220px;
        background: #1976d2;
        flex-direction: column;
        gap: 0;
        padding-top: 60px;
        transition: right 0.3s ease;
        z-index: 100;
      }

      .nav-links a {
        padding: 16px 24px;
        border-bottom: 1px solid rgba(255,255,255,0.2);
      }

      .menu-toggle:checked + .hamburger + .nav-links {
        right: 0;
      }

      .hamburger {
        display: block;
      }
    }

    .app-main {
      padding: 24px;
      background: #f5f5f5;
      min-height: calc(100vh - 60px);
    }
  `]
})
export class AppComponent {
  closeMenu() {
    const checkbox = document.getElementById('menu-toggle') as HTMLInputElement;
    if (checkbox) checkbox.checked = false;
  }
}
