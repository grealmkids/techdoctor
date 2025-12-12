import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { BlogListComponent } from './pages/blog-list/blog-list';
import { BlogDetailComponent } from './pages/blog-detail/blog-detail';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard';
import { LoginComponent } from './pages/login/login';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'blogs', component: BlogListComponent },
    { path: 'blogs/:slug', component: BlogDetailComponent },
    { path: 'login', component: LoginComponent },
    { path: 'admin', component: AdminDashboardComponent, canActivate: [AuthGuard] },
    { path: '**', redirectTo: '' }
];
