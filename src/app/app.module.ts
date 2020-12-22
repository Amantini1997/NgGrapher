import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CodeInputComponent } from './code-input/code-input.component';
import { CodeOutputComponent } from './code-output/code-output.component';
import { GeneratorPageComponent } from './generator-page/generator-page.component';
import { FormsModule } from '@angular/forms';
import { AnimationPageComponent } from './animation-page/animation-page.component';
import { InstructionsPageComponent } from './instructions-page/instructions-page.component';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';
import { NgxSliderModule } from '@angular-slider/ngx-slider';

 

@NgModule({
  declarations: [
    AppComponent,
    CodeInputComponent,
    CodeOutputComponent,
    GeneratorPageComponent,
    AnimationPageComponent,
    InstructionsPageComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    CodemirrorModule,
    NgxSliderModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
