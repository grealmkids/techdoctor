import { Injectable } from '@angular/core';
import { Auth, GoogleAuthProvider, signInWithPopup, signOut, user, User } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    user$: Observable<User | null>;

    // Admin whitelist
    private allowedEmails = ['ochalfie@gmail.com'];

    constructor(private auth: Auth, private router: Router) {
        this.user$ = user(this.auth);
    }

    async loginWithGoogle() {
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(this.auth, provider);
            const email = result.user.email;

            if (email && this.allowedEmails.includes(email)) {
                console.log('✅ Admin login success:', email);
                this.router.navigate(['/admin']);
            } else {
                console.warn('⛔ Unauthorized login attempt:', email);
                await this.logout();
                alert('Access Denied. Admins Only.');
            }
        } catch (err) {
            console.error('Login failed', err);
        }
    }

    async logout() {
        await signOut(this.auth);
        this.router.navigate(['/']);
    }

    isAdmin(): Observable<boolean> {
        return this.user$.pipe(
            map(user => !!user && !!user.email && this.allowedEmails.includes(user.email))
        );
    }

    async getIdToken(): Promise<string | null> {
        const u = this.auth.currentUser;
        return u ? u.getIdToken() : null;
    }
}
