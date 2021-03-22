import { Component } from '@angular/core';
import { AnimationConfig } from '../interfaces/codeInterfaces';

@Component({
  selector: 'generator-page',
  templateUrl: './generator-page.component.html',
  styleUrls: ['./generator-page.component.scss']
})
export class GeneratorPageComponent{

  config: AnimationConfig;

  renderCode(config: AnimationConfig) {
    this.config = config;
  }
}
