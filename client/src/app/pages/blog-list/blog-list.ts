import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-blog-list',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe, FormsModule],
  templateUrl: './blog-list.html',
  styleUrl: './blog-list.scss'
})
export class BlogListComponent implements OnInit {
  allBlogs: any[] = [];
  filteredBlogs: any[] = [];
  categories: any[] = [];
  selectedCategory: string = '';
  loading = true;
  Math = Math;

  constructor(private api: ApiService) { }

  ngOnInit() {
    this.api.getBlogs().subscribe({
      next: (data) => {
        this.allBlogs = data;
        this.filteredBlogs = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to fetch blogs', err);
        this.loading = false;
      }
    });

    this.api.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
      }
    });
  }

  searchQuery: string = '';

  filterBlogs() {
    this.filteredBlogs = this.allBlogs.filter(b => {
      const matchesCategory = this.selectedCategory ? b.category_id == this.selectedCategory : true;
      const query = this.searchQuery ? this.searchQuery.toLowerCase() : '';

      const title = b.title ? b.title.toLowerCase() : '';
      const content = b.content ? b.content.toLowerCase() : '';

      const matchesSearch = !query || title.includes(query) || content.includes(query);
      return matchesCategory && matchesSearch;
    });
  }
}
