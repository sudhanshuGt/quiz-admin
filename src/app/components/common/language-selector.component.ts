import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatMenuModule,
    MatIconModule,
    MatTooltipModule
  ],
  template: `
    <div class="language-selector">
      <!-- Language Tabs -->
      <div class="language-tabs">
        <button 
          *ngFor="let lang of selectedLanguageInfo" 
          [class.active]="lang.code === currentLanguage"
          (click)="onSelectLanguage(lang.code)"
          class="language-tab"
          [matTooltip]="lang.name">
          <span class="flag">{{ lang.flag }}</span>
          <span class="code">{{ lang.code.toUpperCase() }}</span>
        </button>

        <!-- Add Language Button -->
        <button 
          mat-icon-button 
          [matMenuTriggerFor]="menu"
          class="add-language-btn"
          matTooltip="Add language">
          <mat-icon>add</mat-icon>
        </button>
      </div>

      <!-- Language Selection Menu -->
      <mat-menu #menu="matMenu" class="language-menu">
        <div class="menu-header">Select languages:</div>
        <button 
          mat-menu-item 
          *ngFor="let lang of allLanguages"
          (click)="onToggleLanguage(lang.code)"
          class="language-option">
          <mat-checkbox 
            [checked]="selectedLanguages.includes(lang.code)"
            (click)="$event.stopPropagation()">
          </mat-checkbox>
          <span class="flag">{{ lang.flag }}</span>
          <span class="name">{{ lang.name }}</span>
        </button>
      </mat-menu>
    </div>
  `,
  styles: [`
    .language-selector {
      margin-bottom: 20px;
    }

    .language-tabs {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      align-items: center;
      padding: 10px;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      border-radius: 8px;
      border: 1px solid #e0e0e0;
    }

    .language-tab {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 12px;
      border: 2px solid transparent;
      border-radius: 6px;
      background: white;
      cursor: pointer;
      transition: all 0.3s ease;
      font-weight: 500;
      font-size: 13px;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        background: #f0f4f8;
      }

      &.active {
        border-color: #3f51b5;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);

        .flag {
          animation: bounce 0.3s ease;
        }
      }

      .flag {
        font-size: 16px;
      }

      .code {
        letter-spacing: 0.5px;
      }
    }

    @keyframes bounce {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.2); }
    }

    .add-language-btn {
      color: #3f51b5;
      
      &:hover {
        background-color: rgba(63, 81, 181, 0.1);
      }
    }

    .menu-header {
      padding: 12px 16px;
      font-weight: 600;
      color: #333;
      border-bottom: 1px solid #eee;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .language-option {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 16px;
      width: 100%;
      justify-content: flex-start;

      &:hover {
        background-color: #f5f5f5;
      }

      .flag {
        font-size: 18px;
      }

      .name {
        flex: 1;
        text-align: left;
      }
    }

    ::ng-deep .language-menu {
      min-width: 200px;
    }
  `]
})
export class LanguageSelectorComponent implements OnInit {
  selectedLanguages: string[] = [];
  selectedLanguageInfo: any[] = [];
  currentLanguage: string = 'en';
  allLanguages: any[] = [];

  constructor(private languageService: LanguageService) {}

  ngOnInit(): void {
    this.allLanguages = this.languageService.getAvailableLanguages();
    
    this.languageService.selectedLanguages$.subscribe(langs => {
      this.selectedLanguages = langs;
      this.selectedLanguageInfo = this.languageService.getSelectedLanguageInfo();
      
      // If current language is removed, switch to first available
      if (!langs.includes(this.currentLanguage)) {
        this.currentLanguage = langs[0] || 'en';
        this.languageService.setCurrentLanguage(this.currentLanguage);
      }
    });

    this.languageService.currentLanguage$.subscribe(lang => {
      this.currentLanguage = lang;
    });
  }

  onSelectLanguage(code: string): void {
    this.languageService.setCurrentLanguage(code);
  }

  onToggleLanguage(code: string): void {
    const selected = [...this.selectedLanguages];
    const index = selected.indexOf(code);

    if (index === -1) {
      selected.push(code);
    } else if (selected.length > 1) {
      selected.splice(index, 1);
    }

    this.languageService.setSelectedLanguages(selected);
  }
}
