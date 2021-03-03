import { Component } from '@angular/core';
import { CodeED } from '../interfaces/codeInterfaces';

@Component({
  selector: 'generator-page',
  templateUrl: './generator-page.component.html',
  styleUrls: ['./generator-page.component.scss']
})
export class GeneratorPageComponent{

  codeED: CodeED;

  renderCode(codeED: CodeED) {
    this.codeED = codeED;
  }
}
