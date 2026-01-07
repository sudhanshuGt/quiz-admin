import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  // Default supported languages
  supportedLanguages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' }
  ];

  private selectedLanguagesSubject = new BehaviorSubject<string[]>(['en']); // Default to English
  selectedLanguages$ = this.selectedLanguagesSubject.asObservable();

  private currentLanguageSubject = new BehaviorSubject<string>('en');
  currentLanguage$ = this.currentLanguageSubject.asObservable();

  constructor() {
    // Load from localStorage if available
    const saved = localStorage.getItem('selectedLanguages');
    if (saved) {
      try {
        this.selectedLanguagesSubject.next(JSON.parse(saved));
      } catch (e) {
        this.selectedLanguagesSubject.next(['en']);
      }
    }
  }

  /**
   * Get all supported languages
   */
  getAvailableLanguages() {
    return this.supportedLanguages;
  }

  /**
   * Set selected languages for the current quiz/exam
   */
  setSelectedLanguages(languages: string[]): void {
    if (languages.length === 0) languages = ['en'];
    this.selectedLanguagesSubject.next(languages);
    localStorage.setItem('selectedLanguages', JSON.stringify(languages));
  }

  /**
   * Get currently selected languages
   */
  getSelectedLanguages(): string[] {
    return this.selectedLanguagesSubject.value;
  }

  /**
   * Set the current active language for UI
   */
  setCurrentLanguage(code: string): void {
    if (this.getSelectedLanguages().includes(code)) {
      this.currentLanguageSubject.next(code);
    }
  }

  /**
   * Get current active language
   */
  getCurrentLanguage(): string {
    return this.currentLanguageSubject.value;
  }

  /**
   * Check if language is supported
   */
  isLanguageSupported(code: string): boolean {
    return this.supportedLanguages.some(l => l.code === code);
  }

  /**
   * Get language name by code
   */
  getLanguageName(code: string): string {
    return this.supportedLanguages.find(l => l.code === code)?.name || code;
  }

  /**
   * Get language flag emoji
   */
  getLanguageFlag(code: string): string {
    return this.supportedLanguages.find(l => l.code === code)?.flag || '🌐';
  }

  /**
   * Get all language info for selected languages
   */
  getSelectedLanguageInfo() {
    return this.getSelectedLanguages().map(code => ({
      code,
      name: this.getLanguageName(code),
      flag: this.getLanguageFlag(code)
    }));
  }

  /**
   * Export selected languages configuration
   */
  exportLanguageConfig(): any {
    return {
      languages: this.getSelectedLanguages(),
      current: this.getCurrentLanguage()
    };
  }

  /**
   * Import language configuration
   */
  importLanguageConfig(config: any): void {
    if (config.languages && Array.isArray(config.languages)) {
      this.setSelectedLanguages(config.languages);
    }
    if (config.current && this.isLanguageSupported(config.current)) {
      this.setCurrentLanguage(config.current);
    }
  }
}
