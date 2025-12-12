import { Component, ElementRef, Input, OnDestroy, AfterViewInit, ViewChild } from '@angular/core';
import WaveSurfer from 'wavesurfer.js';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-audio-player',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './audio-player.html',
  styleUrl: './audio-player.scss'
})
export class AudioPlayerComponent implements AfterViewInit, OnDestroy {
  @Input() url!: string;
  @Input() darkMode: boolean = false;
  @Input() autoPlay: boolean = false;

  @ViewChild('waveform', { static: true }) waveformRef!: ElementRef;

  private wavesurfer!: WaveSurfer;
  isPlaying = false;
  isMuted = false;
  isLooping = false;
  volume = 1; // 0 to 1
  currentTime = '0:00';
  totalTime = '0:00';

  ngAfterViewInit() {
    if (this.url) {
      this.initWaveSurfer();
    }
  }

  ngOnDestroy() {
    if (this.wavesurfer) {
      this.wavesurfer.destroy();
    }
  }

  initWaveSurfer() {
    // Dark Mode Colors vs Light Mode
    const waveColor = this.darkMode ? 'rgba(255, 255, 255, 0.3)' : '#A8DBA8';
    const progressColor = this.darkMode ? '#00d2ff' : '#3B8686';
    const cursorColor = this.darkMode ? '#ffffff' : '#0B486B';

    this.wavesurfer = WaveSurfer.create({
      container: this.waveformRef.nativeElement,
      waveColor: waveColor,
      progressColor: progressColor,
      cursorColor: cursorColor,
      barWidth: 3,
      barGap: 4,
      barRadius: 3,
      height: this.darkMode ? 100 : 60, // Taller in modal
      backend: 'MediaElement',
      normalize: true,
    });

    this.wavesurfer.load(this.url);

    this.wavesurfer.on('ready', () => {
      this.totalTime = this.formatTime(this.wavesurfer.getDuration());
      if (this.autoPlay) {
        this.wavesurfer.play();
      }
    });

    this.wavesurfer.on('audioprocess', () => {
      this.currentTime = this.formatTime(this.wavesurfer.getCurrentTime());
    });

    this.wavesurfer.on('play', () => this.isPlaying = true);
    this.wavesurfer.on('pause', () => this.isPlaying = false);
    this.wavesurfer.on('finish', () => {
      if (this.isLooping) {
        this.wavesurfer.play();
      } else {
        this.isPlaying = false;
      }
    });
  }

  togglePlay() {
    this.wavesurfer.playPause();
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    this.wavesurfer.setMuted(this.isMuted);
  }

  toggleLoop() {
    this.isLooping = !this.isLooping;
  }

  setVolume(event: any) {
    this.volume = event.target.value;
    this.wavesurfer.setVolume(this.volume);
    if (this.volume > 0) this.isMuted = false;
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }
}
