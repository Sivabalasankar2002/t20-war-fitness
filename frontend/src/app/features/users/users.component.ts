import { Component, Inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

interface User { id: string; email: string; role: 'admin'|'gym_manager'|'member' }

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  baseUrl = '/api';
  displayedColumns = ['email','role'];
  data: User[] = [];
  showAdd = false;

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: ['gym_manager', Validators.required]
  });

  constructor(private http: HttpClient, private fb: FormBuilder, private snack: MatSnackBar, private dialog: MatDialog) {}

  ngOnInit(): void { this.load(); }

  load(page = 1, limit = 10) {
    this.http.get<any>(`${this.baseUrl}/users`, { params: { page, limit } as any }).subscribe(res => this.data = res.data || res);
  }

  toggleAdd() { this.openAdd(); }

  openAdd() {
    this.dialog.open(AddUserDialog, { width: '520px', maxWidth: '95vw' })
      .afterClosed().subscribe(ok => { if (ok) this.load(); });
  }

  // deprecated inline add path kept for reference; now using dialog
}

@Component({
  selector: 'app-add-user-dialog',
  template: `
  <h3 mat-dialog-title>Add User</h3>
  <form [formGroup]="form" (ngSubmit)="save()" mat-dialog-content>
    <mat-form-field appearance="outline" class="w-100 mb-3">
      <mat-label>Email</mat-label>
      <input matInput formControlName="email" />
    </mat-form-field>
    <mat-form-field appearance="outline" class="w-100 mb-3">
      <mat-label>Password</mat-label>
      <input matInput type="password" formControlName="password" />
    </mat-form-field>
    <mat-form-field appearance="outline" class="w-100">
      <mat-label>Role</mat-label>
      <mat-select formControlName="role">
        <mat-option value="admin">Admin</mat-option>
        <mat-option value="gym_manager">Gym Manager</mat-option>
        <mat-option value="member">Member</mat-option>
      </mat-select>
    </mat-form-field>
  </form>
  <div mat-dialog-actions align="end">
    <button mat-button mat-dialog-close>Cancel</button>
    <button mat-raised-button color="primary" (click)="save()" [disabled]="form.invalid">Save</button>
  </div>
  `
})
export class AddUserDialog {
  baseUrl = '/api';
  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: ['gym_manager', Validators.required]
  });
  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private dialogRef: MatDialogRef<AddUserDialog>,
    private snack: MatSnackBar,
  ) {}

  save() {
    if (this.form.invalid) return;
    this.http.post(`${this.baseUrl}/users`, this.form.value).subscribe({
      next: () => { this.snack.open('User created', 'Close', { duration: 2000 }); this.dialogRef.close(true); },
      error: (err) => { const msg = err?.error?.message || 'Create failed'; this.snack.open(msg, 'Close', { duration: 2500 }); }
    });
  }
}
