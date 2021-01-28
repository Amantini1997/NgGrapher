import { Options } from '@angular-slider/ngx-slider';
import { Component, ElementRef, Input, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { AnimatorComponent } from '../animator/animator.component';
import { CodeComment, CodeED } from '../codeInterfaces';
import { Grapher, Sorter, NodeType, EdgeType, DataStructure } from '../grapher';

@Component({
  selector: 'code-output',
  templateUrl: './code-output.component.html',
  styleUrls: ['./code-output.component.scss']
})
export class CodeOutputComponent {

  @ViewChildren("executableLine") executableLines: QueryList<HTMLDivElement>;
  @ViewChild("delay", {read: ElementRef}) delay: ElementRef;
  @ViewChild(AnimatorComponent) animator: AnimatorComponent;
  @Input() 
  set newCodeED(codeED: CodeED) {
    if(!codeED) return;
    this.codeED = codeED;
    this.buildInitialGraph();
  }

  readonly GeneratorFunction = Object.getPrototypeOf(function*(){}).constructor;
  readonly value: number = 2550;
  readonly options: Options = {
      floor: 100,
      ceil: 5000
  };
  readonly CODE_PLACEHOLDER: CodeComment = {
    code: "Code will appear here",
    comment: "Comments will appear here"
  };
  
  currentLine: number;
  currentComment: string;
  animationHasStarted: boolean = false; 
  animationIsPaused: boolean = false;
  animation: any;
  userInput: string[];
  grapher: Grapher;
  codeED: CodeED;

  constructor() { }

  buildInitialGraph() {
    this.grapher = new Sorter(this.codeED.initialValues);
    // TODO Implement buildGraph
    //// this.grapher.buildGraph();
  }

  generateJsFunctionFromCode(): Generator {
    const executableCode = this.codeED.executable;
    return new this.GeneratorFunction("grapher", executableCode)(this.grapher);
  } 
  
  hiLine(line: any) {
    const lineNumber = line.line ?? line;
    this.currentLine = lineNumber;

    //@ts-ignore
    const comment = line.comment || this.executableLines.toArray()[lineNumber].nativeElement.dataset.comment;
    this.currentComment = comment;
  }

  restoreOriginalConfiguration() {
    this.animator.restoreOriginalConfiguration();
  }

  reset(restoreOriginalConfiguration: boolean = true) {
    if (restoreOriginalConfiguration) {
      this.restoreOriginalConfiguration();
    }
    this.animationIsPaused = false;
    this.animationHasStarted = false;
    this.currentLine = null;
    clearTimeout(this.animation);
  }

  startAnimation() {
    this.animationHasStarted = true;
    var iter = this.generateJsFunctionFromCode();
    const line = iter.next();
    this.animationInterval(iter, line);
  }

  animationInterval = (iter: any, line: any) => {
    let waitingInterval: number;
    if (line.done) {
      // generator is done
      this.reset(false);
      return;
    } 
    
    if (this.animationIsPaused) {
      // animation is paused, check for awakes
      waitingInterval = 100;
    } else {
      // animation is running
      this.hiLine(line.value);
      line = iter.next();
      waitingInterval = +this.delay.nativeElement.innerHTML;
    }

    this.animation = setTimeout(this.animationInterval, waitingInterval, iter, line);
  }

  togglePause() {
    this.animationIsPaused = !this.animationIsPaused;
  }

  appendElement() {
    const structure = this.grapher.getDataStructure()
    switch(structure) {
      case DataStructure.BarPlot: {

      }
      case DataStructure.List: {

      }
      case DataStructure.Tree: {

      }
    }
  }
}

