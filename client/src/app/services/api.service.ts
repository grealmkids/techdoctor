import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Auth } from '@angular/fire/auth';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private apiUrl = 'http://localhost:3000/api/v1';

    constructor(private http: HttpClient, private auth: Auth) { }

    getBlogs(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/blogs`);
    }

    getBlogBySlug(slug: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/blogs/${slug}`);
    }

    getCategories(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/categories`);
    }

    createCategory(name: string, slug: string): Observable<any> {
        return new Observable(observer => {
            this.getHeaders().then(options => {
                this.http.post<any>(`${this.apiUrl}/categories`, { name, slug }, options).subscribe({
                    next: res => { observer.next(res); observer.complete(); },
                    error: err => observer.error(err)
                });
            });
        });
    }

    // Admin endpoints
    async getHeaders() {
        const token = this.auth.currentUser ? await this.auth.currentUser.getIdToken() : '';
        return {
            headers: { 'Authorization': `Bearer ${token}` }
        };
    }

    createBlog(data: any): Observable<any> {
        return new Observable(observer => {
            this.getHeaders().then(options => {
                this.http.post<any>(`${this.apiUrl}/blogs`, data, options).subscribe({
                    next: res => { observer.next(res); observer.complete(); },
                    error: err => observer.error(err)
                });
            });
        });
    }

    updateBlog(id: string, data: any): Observable<any> {
        return new Observable(observer => {
            this.getHeaders().then(options => {
                this.http.put<any>(`${this.apiUrl}/blogs/${id}`, data, options).subscribe({
                    next: res => { observer.next(res); observer.complete(); },
                    error: err => observer.error(err)
                });
            });
        });
    }

    deleteBlog(id: string): Observable<any> {
        return new Observable(observer => {
            this.getHeaders().then(options => {
                this.http.delete<any>(`${this.apiUrl}/blogs/${id}`, options).subscribe({
                    next: res => { observer.next(res); observer.complete(); },
                    error: err => observer.error(err)
                });
            });
        });
    }

    uploadFile(formData: FormData): Observable<any> {
        return new Observable(observer => {
            this.getHeaders().then(authOptions => {
                const reqOptions = {
                    headers: authOptions.headers,
                    reportProgress: true,
                    observe: 'events' as 'events'
                };

                this.http.post(`${this.apiUrl}/blogs/upload`, formData, reqOptions).subscribe({
                    next: res => observer.next(res),
                    error: err => observer.error(err),
                    complete: () => observer.complete()
                });
            });
        });
    }

    likeBlog(id: string): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/blogs/${id}/like`, {});
    }
}
