import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, Validators } from '@angular/forms';

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

  constructor(private http: HttpClient, private fb: FormBuilder) {}

  ngOnInit(): void { this.load(); }

  load(page = 1, limit = 10) {
    this.http.get<any>(`${this.baseUrl}/users`, { params: { page, limit } as any }).subscribe(res => this.data = res.data || res);
  }

  toggleAdd() { this.showAdd = !this.showAdd; }

  save() {
    if (this.form.invalid) return;
    this.http.post(`${this.baseUrl}/users`, this.form.value).subscribe({
      next: () => { this.form.reset(); this.showAdd = false; this.load(); },
      error: () => {}
    });
  }
}
