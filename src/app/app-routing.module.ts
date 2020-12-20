import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AnimationPageComponent } from './animation-page/animation-page.component';
import { GeneratorPageComponent } from './generator-page/generator-page.component';
import { InstructionsPageComponent } from './instructions-page/instructions-page.component';

const routes: Routes = [
  {path: 'instructions', component: InstructionsPageComponent },
  {path: 'generator', component: GeneratorPageComponent },
  {path: 'animation', component: AnimationPageComponent },
  {path: '', redirectTo: '/instructions', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
