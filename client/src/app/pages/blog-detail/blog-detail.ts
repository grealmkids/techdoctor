import { Component, OnInit } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { CommonModule, DatePipe } from '@angular/common';
import Swal from 'sweetalert2';
import { AudioPlayerComponent } from '../../components/audio-player/audio-player';
import { SafePipe } from '../../pipes/safe.pipe';
import { MarkdownPipe } from '../../pipes/markdown.pipe';

@Component({
  selector: 'app-blog-detail',
  standalone: true,
  imports: [CommonModule, DatePipe, AudioPlayerComponent, SafePipe, MarkdownPipe, RouterLink],
  templateUrl: './blog-detail.html',
  styleUrl: './blog-detail.scss'
})
export class BlogDetailComponent implements OnInit {
  blog: any;
  loading = true;
  Math = Math;


  constructor(
    private route: ActivatedRoute,
    private api: ApiService
  ) { }

  async ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug) {
      this.api.getBlogBySlug(slug).subscribe({
        next: (data: any) => {
          this.blog = data;
          this.loading = false;

          // Fix YouTube URL for embed
          if (this.blog.youtube_url && this.blog.youtube_url.includes('watch?v=')) {
            this.blog.youtube_url = this.blog.youtube_url.replace('watch?v=', 'embed/');
          }

          this.checkLikedStatus();
        },
        error: (err: any) => {
          console.error(err);
          this.loading = false;
        }
      });
    }
  }

  showAudioPlayer = false;
  showVideoPlayer = false;
  liked = false;

  openAudioModal() {
    this.showAudioPlayer = true;
    document.body.style.overflow = 'hidden';
  }

  closeAudioModal() {
    this.showAudioPlayer = false;
    document.body.style.overflow = '';
  }

  openVideoModal() {
    this.showVideoPlayer = true;
    document.body.style.overflow = 'hidden';
  }

  closeVideoModal() {
    this.showVideoPlayer = false;
    document.body.style.overflow = '';
  }

  likeBlog() {
    if (this.liked) return;

    // Optimistic UI
    this.liked = true;
    this.blog.likes = (this.blog.likes || 0) + 1;

    this.api.likeBlog(this.blog.id).subscribe({
      next: (res) => {
        // Sync with server response
        this.blog.likes = res.likes;
        localStorage.setItem(`liked_${this.blog.id}`, 'true');
      },
      error: (err) => {
        console.error('Like failed', err);
        // Revert on error
        this.liked = false;
        this.blog.likes--;
      }
    });
  }

  shareBlog() {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: this.blog.title,
        text: 'Check out this article by The Tech Doctor!',
        url: url
      }).catch(err => console.log('Share canceled', err));
    } else {
      navigator.clipboard.writeText(url).then(() => {
        Swal.fire({
          icon: 'success',
          title: 'Link Copied!',
          text: 'Article link copied to clipboard.',
          timer: 2000,
          showConfirmButton: false
        });
      });
    }
  }

  // Check storage on load
  checkLikedStatus() {
    if (localStorage.getItem(`liked_${this.blog.id}`)) {
      this.liked = true;
    }
  }
}
