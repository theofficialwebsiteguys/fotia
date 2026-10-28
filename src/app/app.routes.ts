import { Routes } from '@angular/router';

import { HomeComponent } from './pages/home/home.component';
import {
  strainDescriptionResolver,
  strainResolver,
  strainTitleResolver,
} from './pages/strain-detail/strain.resolvers';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  {
    path: 'strains',
    title: 'Strains',
    data: { description: 'Explore every Fotia strain, with links to retailers and batch lab results.' },
    loadComponent: () =>
      import('./pages/strains/strain-directory.component').then((m) => m.StrainDirectoryComponent),
  },
  {
    // ?batch=BATCH_ID selects a batch, so package QR codes can link straight to its COA.
    path: 'strains/:slug',
    title: strainTitleResolver,
    resolve: { strain: strainResolver, description: strainDescriptionResolver },
    loadComponent: () =>
      import('./pages/strain-detail/strain-detail.component').then((m) => m.StrainDetailComponent),
  },
  {
    path: 'find-fotia',
    title: 'Find Fotia',
    data: { description: 'Find retailers that carry Fotia by city or ZIP code.' },
    loadComponent: () => import('./pages/find-fotia/find-fotia.component').then((m) => m.FindFotiaComponent),
  },
  {
    path: 'lab-results',
    title: 'Lab Results',
    data: { description: 'Find the certificate of analysis for any Fotia batch by strain or batch number.' },
    loadComponent: () => import('./pages/lab-results/lab-results.component').then((m) => m.LabResultsComponent),
  },
  {
    path: 'our-story',
    title: 'Our Story',
    data: { description: 'Fotia is Greek for fire. Fire of the Gods.' },
    loadComponent: () => import('./pages/our-story/our-story.component').then((m) => m.OurStoryComponent),
  },
  {
    path: '**',
    title: 'Page not found',
    loadComponent: () => import('./pages/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
];
