import { RouterModule, Routes } from '@angular/router';
import { ModuleWithProviders } from '@angular/core/src/metadata/ng_module';
import { DatasetComponent } from './dataset';
import { CallbackDesignerComponent } from './components/callback-ui/callback-designer/callback-designer.component';

export const AppRoutes: Routes = [
  { path: '', redirectTo: 'callback', pathMatch: 'full' },
  { path: 'data', component: DatasetComponent },
  { path: 'callback', component: CallbackDesignerComponent }
];

export const ROUTING: ModuleWithProviders = RouterModule.forRoot(AppRoutes, { useHash: true });
