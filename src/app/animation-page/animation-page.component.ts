import { Component } from '@angular/core';
import { AnimationConfig } from '../interfaces/codeInterfaces';
import * as templateRaw from '../../assets/templates.json';
import queue from '../../assets/templates/queue.json';
import bubbleSort from '../../assets/templates/bubbleSort.json';
import { interactionError } from '../errorGenerator';

@Component({
  templateUrl: './animation-page.component.html',
  styleUrls: ['./animation-page.component.scss']
})
export class AnimationPageComponent {

  config: AnimationConfig;
  templateOptions: JSON;
  readonly TEMPLATES_PATH = "../../assets/templates/";
  readonly QUEUE_TEMPLATE = queue;
  readonly BUBBLE_SORT_TEMPLATE = bubbleSort;

  constructor() { 
    this.templateOptions = templateRaw.default; 
  }

  loadConfig(event: Event) {    
    const loadableFile = (event.target as HTMLInputElement).files[0];
    const fileReader = new FileReader();
    fileReader.onload = fileLoadedEvent => {
      const configFile = fileLoadedEvent.target.result as string;
      try {
        this.config = JSON.parse(configFile);
      } catch {
        interactionError("The file is not valid");
      }
    };
    fileReader.readAsText(loadableFile, "UTF-8");
  }

  loadTemplateConfig(template: string) {
    switch(template) {
      case "queue":
        this.config = this.QUEUE_TEMPLATE;
        break;

      case "bubbleSort":
        this.config = this.BUBBLE_SORT_TEMPLATE;
        break;
    }
  }
}
