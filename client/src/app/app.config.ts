import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDURVfkbYbJ4_C2r5tynlSj-pf1_3DFRdA",
  authDomain: "techdoctor2026.firebaseapp.com",
  projectId: "techdoctor2026",
  storageBucket: "techdoctor2026.firebasestorage.app",
  messagingSenderId: "612280320322",
  appId: "1:612280320322:web:5e4f704193303ab0b448db",
  measurementId: "G-S7L9QS23RD"
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => getAuth())
  ]
};
