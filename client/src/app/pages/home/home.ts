import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule, DatePipe],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class HomeComponent implements OnInit {
  recentBlogs: any[] = [];
  loading = true;
  Math = Math;

  constructor(private api: ApiService) { }

  ngOnInit() {
    this.api.getBlogs().subscribe({
      next: (data: any[]) => {
        // Take top 3 recent
        this.recentBlogs = data.slice(0, 3);
        this.loading = false;
      },
      error: (err: any) => {
        console.error(err);
        this.loading = false;
      }
    });
  }
}
