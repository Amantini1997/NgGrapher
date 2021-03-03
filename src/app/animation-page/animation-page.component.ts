import { Component } from '@angular/core';
import { CodeED } from '../interfaces/codeInterfaces';
import * as templateRaw from '../../assets/templates.json';
import queue from '../../assets/templates/queue.json';
import bubbleSort from '../../assets/templates/bubbleSort.json';

@Component({
  templateUrl: './animation-page.component.html',
  styleUrls: ['./animation-page.component.scss']
})
export class AnimationPageComponent {

  config: CodeED;
  templateOptions: JSON;
  readonly TEMPLATES_PATH = "../../assets/templates/";

  constructor() { 
    this.templateOptions = templateRaw.default; 
  }

  loadConfig(event: any) {
    const loadableFile = event.target.files[0];
    const fileReader = new FileReader();
    fileReader.onload = fileLoadedEvent => {
      const configFile = fileLoadedEvent.target.result as string;
      this.config = JSON.parse(configFile);
      console.log(this.config)
    };
    fileReader.readAsText(loadableFile, "UTF-8");
  }

  async loadTemplateConfig(template: string) {
    switch(template) {
      case "queue":
        this.config = queue;
        break;

      case "bubble sort":
        this.config = bubbleSort;
        break;
    }
    console.log(this.config, queue)
    // await import(this.TEMPLATES_PATH + templatePath).then(config => {
    //   console.log(config)
    //   this.config = config;
    // });
  }
}
