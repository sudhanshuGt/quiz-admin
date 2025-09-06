import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { QuizService } from '../../quiz.service';

@Component({
  selector: 'app-ebook-form',
  standalone: true,
  templateUrl: './ebook-form.component.html',
  styleUrls: ['./ebook-form.component.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatCardModule
  ]
})
export class EbookFormComponent implements OnInit {
  form: FormGroup;
  saving = false;
  msg = '';
  subjects: string[] = [];

  constructor(private fb: FormBuilder, private svc: QuizService) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      subject: ['', Validators.required],
      url: ['', [Validators.required, Validators.pattern(/^https?:\/\//)]]
    });
  }

  ngOnInit(): void {
    this.loadSubjects();
  }

  async loadSubjects() {
    this.subjects = await this.svc.getSubjects(); // fetch from Firebase
  }

  async saveEbook() {
    if (this.form.invalid) return;

    this.saving = true;
    this.msg = '';
    try {
      await this.svc.addEbook(this.form.value);
      this.msg = '✅ E-Book saved successfully!';
      this.form.reset();
    } catch (e: any) {
      this.msg = e?.message || '❌ Error while saving';
    } finally {
      this.saving = false;
    }
  }
}
