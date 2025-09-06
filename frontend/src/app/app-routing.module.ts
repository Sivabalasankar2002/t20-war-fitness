import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [{ path: 'auth', loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule) }, { path: 'members', loadChildren: () => import('./features/members/members.module').then(m => m.MembersModule) }, { path: 'dashboard', loadChildren: () => import('./features/dashboard/dashboard.module').then(m => m.DashboardModule) }, { path: 'plans', loadChildren: () => import('./features/plans/plans.module').then(m => m.PlansModule) }, { path: 'member/:id', loadChildren: () => import('./features/member-detail/member-detail.module').then(m => m.MemberDetailModule) }, { path: 'users', loadChildren: () => import('./features/users/users.module').then(m => m.UsersModule) }];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
