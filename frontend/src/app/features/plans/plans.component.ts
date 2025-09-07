import { Component, Inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

interface Plan { id: string; name: string; fees: number; durationDays: number; features?: string }

@Component({
  selector: 'app-plans',
  templateUrl: './plans.component.html',
  styleUrls: ['./plans.component.scss']
})
export class PlansComponent implements OnInit {
  baseUrl = '/api';
  displayedColumns = ['name','fees','durationDays','actions'];
  data: Plan[] = [];
  showAdd = false;

  form = this.fb.group({
    name: ['', Validators.required],
    fees: [0, Validators.required],
    durationDays: [30, Validators.required],
    features: ['']
  });

  constructor(private http: HttpClient, private fb: FormBuilder, private snack: MatSnackBar, private dialog: MatDialog) {}

  ngOnInit(): void { this.load(); }

  load() {
    this.http.get<Plan[]>(`${this.baseUrl}/plans`).subscribe(res => this.data = res);
  }

  toggleAdd() { this.openAdd(); }

  openAdd() {
    this.dialog.open(AddPlanDialog, { width: '520px', maxWidth: '95vw' })
      .afterClosed().subscribe(ok => { if (ok) this.load(); });
  }

  save() {
    if (this.form.invalid) return;
    this.http.post(`${this.baseUrl}/plans`, this.form.value).subscribe({
      next: () => { this.form.reset(); this.showAdd = false; this.load(); this.snack.open('Plan created', 'Close', { duration: 2000 }); },
      error: () => {}
    });
  }

  openEdit(plan: Plan) {
    this.dialog.open(EditPlanDialog, { data: { ...plan }, width: '520px', maxWidth: '95vw' })
      .afterClosed().subscribe(ok => { if (ok) this.load(); });
  }

  delete(plan: Plan) {
    if (!confirm(`Delete plan "${plan.name}"? This cannot be undone for plans not in use.`)) return;
    this.http.delete(`${this.baseUrl}/plans/${plan.id}`).subscribe({
      next: (res: any) => {
        if (res?.deactivated) {
          this.snack.open('Plan has active references. Marked inactive.', 'Close', { duration: 2000 });
        } else {
          this.snack.open('Plan deleted', 'Close', { duration: 2000 });
        }
        this.load();
      },
      error: (err) => {
        const msg = err?.error?.message || 'Delete failed';
        this.snack.open(msg, 'Close', { duration: 2500 });
      }
    });
  }
}

@Component({
  selector: 'app-edit-plan-dialog',
  template: `
  <h3 mat-dialog-title>Edit Plan</h3>
  <form [formGroup]="form" (ngSubmit)="save()" mat-dialog-content>
    <mat-form-field appearance="outline" class="w-100 mb-3">
      <mat-label>Name</mat-label>
      <input matInput formControlName="name" />
    </mat-form-field>
    <mat-form-field appearance="outline" class="w-100 mb-3">
      <mat-label>Fees</mat-label>
      <input matInput type="number" formControlName="fees" />
    </mat-form-field>
    <mat-form-field appearance="outline" class="w-100 mb-3">
      <mat-label>Duration (days)</mat-label>
      <input matInput type="number" formControlName="durationDays" />
    </mat-form-field>
    <mat-form-field appearance="outline" class="w-100">
      <mat-label>Features</mat-label>
      <input matInput formControlName="features" />
    </mat-form-field>
  </form>
  <div mat-dialog-actions align="end">
    <button mat-button mat-dialog-close>Cancel</button>
    <button mat-raised-button color="primary" (click)="save()" [disabled]="form.invalid">Save</button>
  </div>
  `
})
export class EditPlanDialog {
  baseUrl = '/api';
  form = this.fb.group({
    name: ['', Validators.required],
    fees: [0, Validators.required],
    durationDays: [30, Validators.required],
    features: ['']
  });
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Plan,
    private fb: FormBuilder,
    private http: HttpClient,
    private dialogRef: MatDialogRef<EditPlanDialog>,
    private snack: MatSnackBar,
  ) {
    this.form.patchValue(data);
  }

  save() {
    if (this.form.invalid) return;
    this.http.put(`${this.baseUrl}/plans/${this.data.id}`, this.form.value).subscribe({
      next: () => { this.snack.open('Plan updated', 'Close', { duration: 2000 }); this.dialogRef.close(true); },
      error: (err) => { const msg = err?.error?.message || 'Update failed'; this.snack.open(msg, 'Close', { duration: 2500 }); }
    });
  }
}

@Component({
  selector: 'app-add-plan-dialog',
  template: `
  <h3 mat-dialog-title>Add Plan</h3>
  <form [formGroup]="form" (ngSubmit)="save()" mat-dialog-content>
    <mat-form-field appearance="outline" class="w-100 mb-3">
      <mat-label>Name</mat-label>
      <input matInput formControlName="name" />
    </mat-form-field>
    <mat-form-field appearance="outline" class="w-100 mb-3">
      <mat-label>Fees</mat-label>
      <input matInput type="number" formControlName="fees" />
    </mat-form-field>
    <mat-form-field appearance="outline" class="w-100 mb-3">
      <mat-label>Duration (days)</mat-label>
      <input matInput type="number" formControlName="durationDays" />
    </mat-form-field>
    <mat-form-field appearance="outline" class="w-100">
      <mat-label>Features</mat-label>
      <input matInput formControlName="features" />
    </mat-form-field>
  </form>
  <div mat-dialog-actions align="end">
    <button mat-button mat-dialog-close>Cancel</button>
    <button mat-raised-button color="primary" (click)="save()" [disabled]="form.invalid">Save</button>
  </div>
  `
})
export class AddPlanDialog {
  baseUrl = '/api';
  form = this.fb.group({
    name: ['', Validators.required],
    fees: [0, Validators.required],
    durationDays: [30, Validators.required],
    features: ['']
  });
  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private dialogRef: MatDialogRef<AddPlanDialog>,
    private snack: MatSnackBar,
  ) {}

  save() {
    if (this.form.invalid) return;
    this.http.post(`${this.baseUrl}/plans`, this.form.value).subscribe({
      next: () => { this.snack.open('Plan created', 'Close', { duration: 2000 }); this.dialogRef.close(true); },
      error: (err) => { const msg = err?.error?.message || 'Create failed'; this.snack.open(msg, 'Close', { duration: 2500 }); }
    });
  }
}
