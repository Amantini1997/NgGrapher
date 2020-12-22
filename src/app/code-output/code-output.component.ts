import { Options } from '@angular-slider/ngx-slider';
import { Component, Input } from '@angular/core';
import { CodeED } from '../codeInterfaces';
import * as iGrapher from '../grapher';

@Component({
  selector: 'code-output',
  templateUrl: './code-output.component.html',
  styleUrls: ['./code-output.component.scss']
})
export class CodeOutputComponent {

  readonly GeneratorFunction = Object.getPrototypeOf(function*(){}).constructor;
  
  currentLine: HTMLElement;
  delay: number;
  animationIsPaused: boolean;
  value: number = 550;
  options: Options = {
    floor: 100,
    ceil: 999
  };
  userInput: string[];
  grapher: iGrapher.Grapher;

  @Input() codeED: CodeED;
  constructor() { 
    this.animationIsPaused = true;
    this.grapher = new iGrapher.Sorter();
    this.grapher.finalise();
  }

  generateJsFunctionFromCode(): Generator {
    return new this.GeneratorFunction(this.codeED)(this.userInput, this.grapher);
  }
  
  hiLine(line: number | JSON): void {
    //@ts-ignore
    const lineNumber = line.line ?? line;
    const HIGHLIGHT = "highlight";
    if (this.currentLine) {
        this.currentLine.classList.remove(HIGHLIGHT);
    }
    this.currentLine = document.querySelector(`.code-line-${lineNumber}`);
    this.currentLine.classList.add(HIGHLIGHT);  
    
    //@ts-ignore
    const comment = line.comment || this.currentLine.dataset.comment;
    if (comment) {
        console.log(comment);
    }
  }
  
  runHighlighter(): void {
    var iter = this.generateJsFunctionFromCode();
    var line = iter.next();
    var firstIteration = true;
    const linesHighlighter = setInterval(() => {
        if (line.done) {
            clearInterval(linesHighlighter);
        } else if(!this.animationIsPaused) {
            this.hiLine(line.value);
            line = iter.next();
        } else {
            // execution is paused, check for awakes
            this.delay = 100;
        }
    }, firstIteration 
        //@ts-ignore
        ? (firstIteration=false) & 0 
        : this.delay
    );
  }

  updateDelay(delaySlide: HTMLInputElement): void {
    console.log(delaySlide)
    this.delay = +delaySlide.value;
  }

  togglePause(): void {
    this.animationIsPaused = !this.animationIsPaused;
  }
}