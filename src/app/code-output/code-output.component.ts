import { Options } from '@angular-slider/ngx-slider';
import { Component, ElementRef, Input, QueryList, ViewChild, ViewChildren } from '@angular/core';
// import { AnimatorComponent } from '../animator/animator.component';
import { CodeComment, CodeED } from '../codeInterfaces';
import { Grapher, DataStructure } from '../grapher';

@Component({
  selector: 'code-output',
  templateUrl: './code-output.component.html',
  styleUrls: ['./code-output.component.scss']
})
export class CodeOutputComponent {

  @ViewChildren("executableLine") executableLines: QueryList<HTMLDivElement>;
  @ViewChild("delay", {read: ElementRef}) delay: ElementRef;
  @Input() 
  set newCodeED(codeED: CodeED) {
    if(!codeED) return;

    // Check syntax validity of the dynamic code 
    try {
      this.codeED = codeED;
      this.setUpAnimation();
      this.GeneratorFunction("grapher", this.tryCatchCode(codeED.executable))(this.grapher);
    } catch(error) {
      this.codeED = null;
      const errorWindow = window.open("", "", "width=1000, height=400");
      const errorWindowBody = `
      <h2>Syntax Error</h2> 
      <br>
      There is a syntax error in your input code. Please fix it
      before proceeding with the creation of the animation. 
      <br>
      <hr>
      ${error}`;
      errorWindow.document.body.innerHTML = errorWindowBody;
    }
  }

  readonly GeneratorFunction = Object.getPrototypeOf(function*(){}).constructor;
  readonly value: number = 1000;
  readonly options: Options = {
      floor: 100,
      ceil: 2500
  };
  readonly CODE_PLACEHOLDER: CodeComment = {
    code: "Code will appear here",
    comment: "Comments will appear here"
  };
  
  currentLine: number;
  currentComment: string;
  animationHasStarted: boolean = false; 
  animationIsPaused: boolean = false;
  animationHasTerminated: boolean = false;
  animation: any;
  userInput: string[];
  grapher: Grapher;
  codeED: CodeED;

  constructor() { }

  buildInitialGraph() {
    if (this.codeED.structure == DataStructure.BarPlot) {
      //TODO check inputs are numerical
      // this.codeED.initialValues
    }
    const {
      initialValues,
      nodeType, 
      structure
    } = this.codeED;
    this.grapher = new Grapher(nodeType, structure, initialValues);
    // this.grapher = new Sorter(initialValuesAsNumbers);
  }

  // return dynamic code scoped into a try and catch block
  tryCatchCode(code: string): string {
    return `try {${code}} catch(e) { grapher._printError(e) }`;
  }

  generateJsFunctionFromCode(): Generator {
    const executableCode = this.codeED.executable;
    return new this.GeneratorFunction("grapher", this.tryCatchCode(executableCode))(this.grapher);
  } 
  
  hiLine(line: any) {
    const lineNumber = line.line ?? line;
    this.currentLine = lineNumber;

    //@ts-ignore
    const comment = line.comment || this.executableLines.toArray()[lineNumber].nativeElement.dataset.comment;
    this.currentComment = comment;
  }

  setUpAnimation() {
    this.clearAnimation();
    this.restoreOriginalConfiguration();
  }

  restoreOriginalConfiguration() {
    this.buildInitialGraph();
    this.animationHasTerminated = false;
  }

  clearAnimation() {
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
      this.clearAnimation();
      this.animationHasTerminated = true;
      return;
    } 
    
    if (this.animationIsPaused) {
      // animation is paused, check for awakes
      waitingInterval = 100;
    } else {
      // animation is running
      this.hiLine(line.value);
      line = iter.next();
      waitingInterval = Number(this.delay.nativeElement.innerHTML);
    }

    this.animation = setTimeout(this.animationInterval, waitingInterval, iter, line);
  }

  togglePause() {
    this.animationIsPaused = !this.animationIsPaused;
  }

  appendElement() {
    const structure = this.grapher.getDataStructure();
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

