import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  baseUrl = '/api';
  stats = { active: 0, expired: 0, totalFees: 0, upcomingExpiries: 0 };
  constructor(private http: HttpClient) {}
  ngOnInit(): void {
    this.http.get<any>(`${this.baseUrl}/dashboard/stats`).subscribe(res => this.stats = res);
  }
}
