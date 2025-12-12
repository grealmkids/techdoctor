import { bootstrapApplication } from '@angular/platform-browser';
import 'zone.js'; // Helper for Angular Zone
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app';
import './app/config/firebase'; // Initialize Firebase

console.log('🚀 Bootstrapping Angular Application...');

bootstrapApplication(AppComponent, appConfig)
  .then(() => console.log('✅ Bootstrap success!'))
  .catch((err) => console.error('❌ Bootstrap failure:', err));
