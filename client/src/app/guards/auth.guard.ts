import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {
    constructor(private auth: AuthService, private router: Router) { }

    canActivate(): Observable<boolean> {
        return this.auth.isAdmin().pipe(
            take(1),
            tap(isAdmin => {
                if (!isAdmin) {
                    console.warn('⛔ Access denied by AuthGuard');
                    this.router.navigate(['/login']);
                }
            })
        );
    }
}
