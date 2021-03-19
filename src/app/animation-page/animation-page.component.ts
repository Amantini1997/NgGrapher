import { Component } from '@angular/core';
import { CodeED } from '../interfaces/codeInterfaces';
import * as templateRaw from '../../assets/templates.json';
import queue from '../../assets/templates/queue.json';
import bubbleSort from '../../assets/templates/bubbleSort.json';
import { interactionError } from '../errorGenerator';

@Component({
  templateUrl: './animation-page.component.html',
  styleUrls: ['./animation-page.component.scss']
})
export class AnimationPageComponent {

  config: CodeED;
  templateOptions: JSON;
  readonly TEMPLATES_PATH = "../../assets/templates/";
  readonly QUEUE_TEMPLATE = queue;
  readonly BUBBLE_SORT_TEMPLATE = bubbleSort;

  constructor() { 
    this.templateOptions = templateRaw.default; 
  }

  loadConfig(event: any) {
    try {
      const loadableFile = event.target.files[0];
      const fileReader = new FileReader();
      fileReader.onload = fileLoadedEvent => {
        const configFile = fileLoadedEvent.target.result as string;
        this.config = JSON.parse(configFile);
      };
      fileReader.readAsText(loadableFile, "UTF-8");
    } catch {
      interactionError("The file is not valid");
    }
  }

  loadTemplateConfig(template: string) {
    switch(template) {
      case "queue":
        this.config = this.QUEUE_TEMPLATE;
        break;

      case "bubble sort":
        this.config = this.BUBBLE_SORT_TEMPLATE;
        break;
    }
  }
}
