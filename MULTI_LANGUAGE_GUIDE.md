# Multi-Language Question Management System 🌐

## Overview
This system enables you to create quiz questions in multiple languages simultaneously, with an intuitive tab-based interface for managing translations.

---

## Features

### 🎯 Easy Language Selection
- **Quick Toggle**: Click the "+" button to add/remove languages
- **Visual Indicators**: Flag emojis 🇬🇧 🇮🇳 🇪🇸 for quick identification
- **Persistent Settings**: Your language selection is saved automatically

### 📝 Multi-Language Question Entry
- **Tab-Based Interface**: Each language gets its own dedicated tab
- **Synchronized Flow**: 
  - Question Text (in each language)
  - Option A, B, C, D (in each language)
  - Correct Answer (in each language)

### 📦 Smart Data Structure
Questions are stored with complete multi-language support:
```json
{
  "title": {
    "en": "What is the capital of India?",
    "hi": "भारत की राजधानी क्या है?"
  },
  "options": {
    "en": ["New Delhi", "Mumbai", "Kolkata", "Bangalore"],
    "hi": ["नई दिल्ली", "मुंबई", "कोलकाता", "बेंगलुरु"]
  },
  "correctAnswer": {
    "en": "New Delhi",
    "hi": "नई दिल्ली"
  },
  "languages": ["en", "hi"]
}
```

---

## How to Use

### Step 1: Select Languages
1. Navigate to the **"Add Question with Multi-Language Support"** section
2. Look for the **Language Selector** at the top
3. Click the **"+" button** to open language menu
4. Check the languages you want to use:
   - 🇬🇧 English (en)
   - 🇮🇳 हिंदी (hi)
   - 🇪🇸 Español (es)
   - 🇫🇷 Français (fr)
   - 🇩🇪 Deutsch (de)
   - 🇨🇳 中文 (zh)
   - 🇸🇦 العربية (ar)
   - 🇵🇹 Português (pt)

### Step 2: Fill Question Details
1. **Tabs appear** for each selected language
2. **Click a tab** to switch languages (e.g., 🇬🇧 English)
3. **Enter the question** in that language
4. **Fill options A, B, C, D** in that language
5. **Select the correct answer** (A, B, C, or D)
6. **Repeat** for each language tab

### Step 3: Save Question
1. **Verify** all required fields are filled
2. Click **"✓ Save Multi-Language Question"** button
3. You'll see confirmation: ✅ Question saved in 2 language(s): English, हिंदी

---

## Best Practices

### ✅ Do's
- **Keep meanings consistent** across languages
- **Use equivalent option order** (don't shuffle answers)
- **Test translations** if you're not a native speaker
- **Use proper terminology** specific to your domain
- **Add image URL** if the question includes a diagram (applies to all languages)

### ❌ Don'ts
- **Don't translate literally** - preserve the meaning
- **Don't change option order** between languages
- **Don't mix languages** in a single field
- **Don't forget** to fill all languages before saving

---

## Supported Languages

| Code | Language | Flag |
|------|----------|------|
| en | English | 🇬🇧 |
| hi | हिंदी | 🇮🇳 |
| es | Español | 🇪🇸 |
| fr | Français | 🇫🇷 |
| de | Deutsch | 🇩🇪 |
| zh | 中文 | 🇨🇳 |
| ar | العربية | 🇸🇦 |
| pt | Português | 🇵🇹 |

---

## Workflow Example

### Scenario: Create a Physics Question in English & Hindi

**Language Selection:**
1. Open Language Selector → Click "+"
2. Check: English ✓, हिंदी ✓
3. Active tabs now show: [🇬🇧 English] [🇮🇳 हिंदी]

**English Tab:**
```
Question: What is the SI unit of force?
A) Newton
B) Joule
C) Pascal
D) Watt
Correct Answer: A
```

**हिंदी Tab:**
```
Question: बल की SI इकाई क्या है?
A) न्यूटन
B) जूल
C) पास्कल
D) वाट
Correct Answer: A
```

**Save:**
- Click "✓ Save Multi-Language Question"
- Get confirmation: ✅ Question saved in 2 language(s): English, हिंदी

---

## Technical Details

### Form Structure
```
questionForm: {
  titles: {
    en: "...",
    hi: "..."
  },
  optionsByLanguage: {
    en: ["Option A", "Option B", "Option C", "Option D"],
    hi: ["विकल्प A", "विकल्प B", "विकल्प C", "विकल्प D"]
  },
  correctAnswers: {
    en: "A",
    hi: "A"
  },
  imageUrl: "..." (shared)
}
```

### Services
- **LanguageService**: Manages language selection and persistence
- **QuizHierarchyService**: Handles question storage
- **exam.model.ts**: Defines LocalizedContent interfaces

### Components
- **LanguageSelectorComponent**: Language toggle UI
- **ExamComponent**: Main form with tabbed interface

---

## Troubleshooting

### ❓ "Please fill in all required fields for all selected languages"
**Solution:** Make sure you've filled the question text, all 4 options, and correct answer in EVERY selected language tab.

### ❓ Languages disappeared after page refresh
**Solution:** Your selections are saved. Check if your browser allows localStorage. Clear cache and reload if needed.

### ❓ Tab switching is slow
**Solution:** This is normal for large forms. The system validates all languages in real-time.

### ❓ Can I add a language after starting to fill?
**Solution:** Yes! Add languages anytime. Empty tabs will appear for new languages. Fill those tabs before saving.

---

## Performance Notes

- **Auto-saving**: Not enabled (manual save only)
- **Validation**: Real-time, per language
- **Storage**: Questions stored in Firebase (or your backend)
- **Browser Support**: All modern browsers (Chrome, Firefox, Safari, Edge)

---

## Future Enhancements

🔮 Planned features:
- Bulk import with language mapping
- Auto-translation suggestions
- Language-specific difficulty levels
- Question comparison view across languages
- Export questions in all languages

---

## Contact & Support

For issues or feature requests, contact your admin team.

**Last Updated:** January 2026
**Version:** 1.0.0
