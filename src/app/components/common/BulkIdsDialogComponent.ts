import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-bulk-ids-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  template: `
    <h2 mat-dialog-title>Uploaded Question IDs</h2>
    <mat-dialog-content>
      <mat-form-field class="full-width">
        <textarea matInput rows="10" readonly>{{ data.ids.join('\n') }}</textarea>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Close</button>
      <button mat-button (click)="copyToClipboard()">Copy</button>
    </mat-dialog-actions>
  `,
})
export class BulkIdsDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { ids: string[] }) {}

  copyToClipboard() {
    navigator.clipboard.writeText(this.data.ids.join('\n'));
    alert('Copied to clipboard!');
  }
}
