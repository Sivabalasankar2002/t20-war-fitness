import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, Validators } from '@angular/forms';

interface Plan { id: string; name: string }
interface Member {
  id: string;
  name: string;
  age: number;
  phone?: string;
  email?: string;
  startDate: string;
  endDate: string;
  feesPaid: number;
  status: string;
  membershipPlan: Plan;
}
interface Payment { id: string; amount: number; paidOn: string }
interface Checkin { id: string; checkinAt: string; checkoutAt?: string }

@Component({
  selector: 'app-member-detail',
  templateUrl: './member-detail.component.html',
  styleUrls: ['./member-detail.component.scss']
})
export class MemberDetailComponent implements OnInit {
  baseUrl = '/api';
  memberId!: string;
  member?: Member;
  payments: Payment[] = [];
  checkins: Checkin[] = [];
  
  constructor(private route: ActivatedRoute, private http: HttpClient, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.memberId = this.route.snapshot.paramMap.get('id') as string;
    this.load();
  }

  load() {
    this.http.get<Member>(`${this.baseUrl}/members/${this.memberId}`).subscribe(m => this.member = m);
    this.http.get<Payment[]>(`${this.baseUrl}/payments/${this.memberId}`).subscribe(p => this.payments = p);
    this.http.get<Checkin[]>(`${this.baseUrl}/checkins/${this.memberId}/history`).subscribe(c => this.checkins = c);
  }

  checkIn() { this.http.post(`${this.baseUrl}/checkins/${this.memberId}/checkin`, {}).subscribe(() => this.load()); }
  checkOut() { this.http.post(`${this.baseUrl}/checkins/${this.memberId}/checkout`, {}).subscribe(() => this.load()); }
  addPayment() {
    this.dialog.open(AddPaymentDialog, { data: { memberId: this.memberId }, width: '420px', maxWidth: '95vw' })
      .afterClosed().subscribe(ok => { if (ok) this.load(); });
  }

  openEdit() {
    if (!this.member) return;
    this.dialog.open(EditMemberDialog, { data: this.member, width: '700px', maxWidth: '95vw' }).afterClosed().subscribe(updated => {
      if (updated) this.load();
    });
  }
}

@Component({
  selector: 'app-edit-member-dialog',
  template: `
  <h3 mat-dialog-title>Edit / Renew</h3>
  <form [formGroup]="form" (ngSubmit)="save()" mat-dialog-content>
    <div class="row g-2">
      <div class="col-md-6">
        <mat-form-field appearance="outline" class="w-100">
          <mat-label>Name</mat-label>
          <input matInput formControlName="name" />
        </mat-form-field>
      </div>
      <div class="col-md-3">
        <mat-form-field appearance="outline" class="w-100">
          <mat-label>Age</mat-label>
          <input matInput type="number" formControlName="age" />
        </mat-form-field>
      </div>
      <div class="col-md-3">
        <mat-form-field appearance="outline" class="w-100">
          <mat-label>Fees Paid</mat-label>
          <input matInput type="number" formControlName="feesPaid" />
        </mat-form-field>
      </div>
      <div class="col-md-6">
        <mat-form-field appearance="outline" class="w-100">
          <mat-label>Phone</mat-label>
          <input matInput formControlName="phone" />
        </mat-form-field>
      </div>
      <div class="col-md-6">
        <mat-form-field appearance="outline" class="w-100">
          <mat-label>Email</mat-label>
          <input matInput type="email" formControlName="email" />
        </mat-form-field>
      </div>
      <div class="col-md-6">
        <mat-form-field appearance="outline" class="w-100">
          <mat-label>Start Date</mat-label>
          <input matInput [matDatepicker]="startPicker" formControlName="startDate" />
          <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
          <mat-datepicker #startPicker></mat-datepicker>
        </mat-form-field>
      </div>
      <div class="col-md-6">
        <mat-form-field appearance="outline" class="w-100">
          <mat-label>End Date</mat-label>
          <input matInput [matDatepicker]="endPicker" formControlName="endDate" />
          <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
          <mat-datepicker #endPicker></mat-datepicker>
        </mat-form-field>
      </div>
    </div>
  </form>
  <div mat-dialog-actions align="end">
    <button mat-button mat-dialog-close>Cancel</button>
    <button mat-raised-button color="primary" (click)="save()">Save</button>
  </div>
  `
})
export class EditMemberDialog {
  baseUrl = '/api';
  form = this.fb.group({
    name: ['',[Validators.required]],
    age: [0,[Validators.required]],
    phone: [''],
    email: [''],
    startDate: [null as unknown as Date,[Validators.required]],
    endDate: [null as unknown as Date,[Validators.required]],
    feesPaid: [0],
  });
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Member,
    private fb: FormBuilder,
    private http: HttpClient,
    private dialogRef: MatDialogRef<EditMemberDialog>,
  ) {
    this.form.patchValue({
      name: data.name,
      age: data.age,
      phone: data.phone,
      email: data.email,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      feesPaid: data.feesPaid as number,
    });
  }
  save() {
    if (this.form.invalid) return;
    let v = this.form.value;
    console.log(v);
    v.feesPaid = Number(v.feesPaid);
    const payload = {
      ...v,
      startDate: this.toDateString(v.startDate),
      endDate: this.toDateString(v.endDate),
    };
    this.http.put(`${this.baseUrl}/members/${this.data.id}`, payload).subscribe(() => this.dialogRef.close(true));
  }

  private toDateString(d: Date): string {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
}

@Component({
  selector: 'app-add-payment-dialog',
  template: `
  <h3 mat-dialog-title>Add Payment</h3>
  <form [formGroup]="form" (ngSubmit)="save()" mat-dialog-content>
    <mat-form-field appearance="outline" class="w-100 mb-3">
      <mat-label>Amount</mat-label>
      <input matInput type="number" formControlName="amount" />
    </mat-form-field>
    <mat-form-field appearance="outline" class="w-100">
      <mat-label>Paid On</mat-label>
      <input matInput [matDatepicker]="pkr" formControlName="paidOn" />
      <mat-datepicker-toggle matSuffix [for]="pkr"></mat-datepicker-toggle>
      <mat-datepicker #pkr></mat-datepicker>
    </mat-form-field>
  </form>
  <div mat-dialog-actions align="end">
    <button mat-button mat-dialog-close>Cancel</button>
    <button mat-raised-button color="primary" (click)="save()" [disabled]="form.invalid">Save</button>
  </div>
  `
})
export class AddPaymentDialog {
  baseUrl = '/api';
  form = this.fb.group({
    amount: [0, [Validators.required, Validators.min(1)]],
    paidOn: [new Date(), [Validators.required]],
  });
  constructor(
    @Inject(MAT_DIALOG_DATA) private data: { memberId: string },
    private fb: FormBuilder,
    private http: HttpClient,
    private dialogRef: MatDialogRef<AddPaymentDialog>,
  ) {}

  private toDateString(d: Date): string {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  save() {
    if (this.form.invalid) return;
    const v = this.form.value as any;
    const payload = { amount: Number(v.amount), paidOn: this.toDateString(v.paidOn) };
    this.http.post(`${this.baseUrl}/payments/${this.data.memberId}`, payload)
      .subscribe(() => this.dialogRef.close(true));
  }
}
