import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, Validators } from '@angular/forms';

interface Plan { id: string; name: string; fees: number; durationDays: number; features?: string }

@Component({
  selector: 'app-plans',
  templateUrl: './plans.component.html',
  styleUrls: ['./plans.component.scss']
})
export class PlansComponent implements OnInit {
  baseUrl = '/api';
  displayedColumns = ['name','fees','durationDays'];
  data: Plan[] = [];
  showAdd = false;

  form = this.fb.group({
    name: ['', Validators.required],
    fees: [0, Validators.required],
    durationDays: [30, Validators.required],
    features: ['']
  });

  constructor(private http: HttpClient, private fb: FormBuilder) {}

  ngOnInit(): void { this.load(); }

  load() {
    this.http.get<Plan[]>(`${this.baseUrl}/plans`).subscribe(res => this.data = res);
  }

  toggleAdd() { this.showAdd = !this.showAdd; }

  save() {
    if (this.form.invalid) return;
    this.http.post(`${this.baseUrl}/plans`, this.form.value).subscribe({
      next: () => { this.form.reset(); this.showAdd = false; this.load(); },
      error: () => {}
    });
  }
}
