import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { FileUploadComponent } from '../../components/file-upload/file-upload.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, FileUploadComponent],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss'
})
export class AdminDashboardComponent implements OnInit {
  view: 'list' | 'form' = 'list';
  isEditing: boolean = false;
  blogs: any[] = [];
  categories: any[] = [];

  newCategoryName: string = '';
  showCategoryInput: boolean = false;

  blog: any = {
    title: '',
    slug: '',
    content: '',
    banner_image: '',
    youtube_url: '',
    podcast_url: '',
    podcast_published: false,
    published: true,
    podcast_duration_seconds: 0,
    category_id: '',
    author_name: '',
    author_image: '',
    author_email: '',
    author_whatsapp: '',
    author_linkedin: '',
    author_profession: ''
  };

  constructor(private api: ApiService, public auth: AuthService) { }

  ngOnInit() {
    this.loadBlogs();
    this.loadCategories();
  }

  loadBlogs() {
    this.api.getBlogs().subscribe((blogs: any[]) => {
      this.blogs = blogs;
    });
  }

  loadCategories() {
    this.api.getCategories().subscribe((cats: any[]) => {
      this.categories = cats;
    });
  }

  createCategory() {
    if (!this.newCategoryName) return;
    const slug = this.newCategoryName.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

    this.api.createCategory(this.newCategoryName, slug).subscribe({
      next: (cat: any) => {
        this.categories.push(cat);
        this.blog.category_id = cat.id;
        this.showCategoryInput = false;
        this.newCategoryName = '';
        Swal.fire('Success', 'Category created!', 'success');
      },
      error: () => Swal.fire('Error', 'Failed to create category', 'error')
    });
  }

  switchToForm(reset = true) {
    this.view = 'form';
    if (reset) this.resetForm();
  }

  switchToList() {
    this.view = 'list';
    this.loadBlogs();
  }

  setBanner(url: string) { this.blog.banner_image = url; }
  setPodcast(url: string) { this.blog.podcast_url = url; }
  setAuthorImage(url: string) { this.blog.author_image = url; }

  editBlog(b: any) {
    this.blog = { ...b };
    this.isEditing = true;
    this.view = 'form';

    this.api.getBlogBySlug(b.slug).subscribe((fullBlog: any) => {
      this.blog = { ...this.blog, ...fullBlog };
    });
  }

  async deleteBlog(id: string) {
    const res = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (res.isConfirmed) {
      this.api.deleteBlog(id).subscribe({
        next: () => {
          Swal.fire('Deleted!', 'Your file has been deleted.', 'success');
          this.loadBlogs();
        },
        error: () => Swal.fire('Error', 'Failed to delete.', 'error')
      });
    }
  }

  submitBlog() {
    Swal.fire({
      title: 'Saving...',
      didOpen: () => Swal.showLoading()
    });

    const obs$ = this.isEditing
      ? this.api.updateBlog(this.blog.id, this.blog)
      : this.api.createBlog(this.blog);

    obs$.subscribe({
      next: () => {
        Swal.fire('Success', `Blog ${this.isEditing ? 'updated' : 'created'}!`, 'success');
        this.switchToList();
      },
      error: (err: any) => {
        console.error(err);
        Swal.fire('Error', 'Failed to save blog.', 'error');
      }
    });
  }

  resetForm() {
    this.isEditing = false;
    this.blog = {
      title: '',
      slug: '',
      content: '',
      banner_image: '',
      youtube_url: '',
      podcast_url: '',
      podcast_published: false,
      published: true,
      podcast_duration_seconds: 0,
      category_id: '',
      author_name: '',
      author_image: '',
      author_email: '',
      author_whatsapp: '',
      author_linkedin: '',
      author_profession: ''
    };
  }

  logout() {
    this.auth.logout();
  }
}
