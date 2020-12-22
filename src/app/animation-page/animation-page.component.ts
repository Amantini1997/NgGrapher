import { Component } from '@angular/core';
import { CodeED } from '../codeInterfaces';

@Component({
  templateUrl: './animation-page.component.html',
  styleUrls: ['./animation-page.component.scss']
})
export class AnimationPageComponent {

  config: CodeED;

  constructor() { }

  onReaderLoad(event: any): void {
    this.config = JSON.parse(event.target.result);
  }

  loadConfiguration(inputElement: any): void {
    var reader = new FileReader();
    reader.onload = this.onReaderLoad;
    reader.readAsText(inputElement.files[0]);
  }
}
