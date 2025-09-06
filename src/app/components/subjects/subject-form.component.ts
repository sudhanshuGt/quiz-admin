import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { QuizService } from '../../quiz.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-subject-form',
  standalone: true,
  templateUrl: './subject-form.component.html',
  styleUrls: ['./subject-form.component.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatListModule,
    MatIconModule
  ]
})
export class SubjectFormComponent implements OnInit {
  form: FormGroup;
  subjects: string[] = [];
  selectedSubject: string | null = null;
  saving = false;
  msg = '';

  constructor(private fb: FormBuilder, private svc: QuizService) {
    this.form = this.fb.group({
      name: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadSubjects();
  }

  async loadSubjects() {
    this.subjects = await this.svc.getSubjects();
  }

  selectSubject(subject: string) {
    this.selectedSubject = subject;
  }

  async addSubject() {
    if (this.form.invalid) return;

    this.saving = true;
    this.msg = '';
    try {
      await this.svc.addSubject(this.form.value.name);
      this.msg = '✅ Subject added successfully!';
      this.form.reset();
      this.loadSubjects();
    } catch (e: any) {
      this.msg = e?.message || '❌ Error while adding subject';
    } finally {
      this.saving = false;
    }
  }
}
