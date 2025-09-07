import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  baseUrl = '/api';
  stats = { active: 0, expired: 0, totalFees: 0, upcomingExpiries: 0 };
  constructor(private http: HttpClient, public auth: AuthService) {}
  ngOnInit(): void {
    const role = this.auth.getRole();
    if (role === 'admin' || role === 'gym_manager') {
      this.http.get<any>(`${this.baseUrl}/dashboard/stats`).subscribe(res => this.stats = res);
    }
  }
}
