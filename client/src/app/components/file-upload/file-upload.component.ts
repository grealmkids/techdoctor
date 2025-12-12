import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="upload-container">
      <label class="file-label" [for]="inputId">
        <span *ngIf="!previewUrl && !uploading">Click to Upload {{ label }}</span>
        <span *ngIf="uploading && progress < 100">Uploading... {{ progress }}%</span>
        <span *ngIf="uploading && progress === 100">Processing... (Sending to Cloud) ☁️</span>
        <span *ngIf="previewUrl && !uploading">Change {{ label }} (Uploaded ✅)</span>
      </label>
      <input 
        [id]="inputId" 
        type="file" 
        [accept]="accept" 
        (change)="onFileSelected($event)"
        class="hidden-input"
        [disabled]="uploading"
      >

      <!-- Progress Bar -->
      <div class="progress-track" *ngIf="uploading || progress > 0">
        <div class="progress-fill" [style.width.%]="progress"></div>
      </div>

      <!-- Preview (Image) -->
      <img *ngIf="previewUrl && accept.includes('image')" [src]="previewUrl" class="preview-img">
      
      <!-- Audio Preview -->
      <div *ngIf="previewUrl && accept.includes('audio')" class="audio-marker">
        🎵 Audio Ready
      </div>
    </div>
  `,
  styles: [`
    .upload-container {
      border: 2px dashed #e0e0e0;
      border-radius: 8px;
      padding: 1rem;
      text-align: center;
      transition: all 0.3s ease;
      background: #fafafa;
    }
    .upload-container:hover { border-color: var(--color-primary); background: #f0f7ff; }
    
    .file-label { display: block; cursor: pointer; font-weight: 500; color: #555; margin-bottom: 0.5rem; }
    .hidden-input { display: none; }

    .progress-track {
      height: 6px;
      background: #eee;
      border-radius: 3px;
      overflow: hidden;
      margin-top: 10px;
    }
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--color-primary) 0%, #00d2ff 100%);
      transition: width 0.3s ease;
    }

    .preview-img { max-width: 100%; height: auto; max-height: 150px; margin-top: 10px; border-radius: 6px; }
    .audio-marker { margin-top: 10px; color: green; font-weight: bold; }
  `]
})
export class FileUploadComponent {
  @Input() label: string = 'File';
  @Input() accept: string = '*/*';
  @Input() inputId: string = 'file-upload-' + Math.random().toString(36).substr(2, 9);
  @Input() folder: string = 'uploads';
  @Input() initialUrl: string = ''; // For edit mode

  @Output() urlChange = new EventEmitter<string>();

  progress: number = 0;
  uploading: boolean = false;
  previewUrl: string = '';

  constructor(private http: HttpClient, private api: ApiService) { }

  ngOnChanges() {
    if (this.initialUrl) {
      this.previewUrl = this.initialUrl;
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.uploadFile(file);
    }
  }

  uploadFile(file: File) {
    this.uploading = true;
    this.progress = 0;
    console.log('🚀 [Upload] Starting upload for:', file.name);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', this.folder);

    // Use ApiService which handles Auth Headers
    this.api.uploadFile(formData).subscribe({
      next: (event: any) => {
        if (event.type === HttpEventType.UploadProgress) {
          this.progress = Math.round(100 * (event.loaded / event.total));
          console.log(`⏳ [Upload] Progress: ${this.progress}%`);
        } else if (event.type === HttpEventType.Response) {
          this.uploading = false;
          this.previewUrl = event.body.url;
          console.log('✅ [Upload] Success! URL:', this.previewUrl);
          this.urlChange.emit(this.previewUrl);
        }
      },
      error: (err) => {
        console.error('❌ [Upload] Failed:', err);
        this.uploading = false;
        alert('Upload failed! Check console for details.');
      }
    });
  }
}
