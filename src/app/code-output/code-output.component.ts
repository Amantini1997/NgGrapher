import { Options } from '@angular-slider/ngx-slider';
import { Component, ElementRef, Input, QueryList, ViewChild, ViewChildren } from '@angular/core';
// import { AnimatorComponent } from '../animator/animator.component';
import { CodeComment, CodeED } from '../interfaces/codeInterfaces';
import { DynamicFunction, InputType, LinesSelection, REGEXES } from '../interfaces/dynamicFunctions';
import { Grapher } from '../grapher';
import { printSyntaxError } from '../errorGenerator';

@Component({
  selector: 'code-output',
  templateUrl: './code-output.component.html',
  styleUrls: ['./code-output.component.scss']
})
export class CodeOutputComponent {

  @ViewChildren("executableLine") executableLines: QueryList<HTMLDivElement>;
  @ViewChild("delay", {read: ElementRef}) delay: ElementRef;

  // readonly GeneratorFunction = Object.getPrototypeOf(function*(){}).constructor;
  readonly value: number = 1000;
  readonly options: Options = {
      floor: 100,
      ceil: 2500
  };
  readonly CODE_PLACEHOLDER: CodeComment = {
    code: "Code will appear here",
    comment: "Comments will appear here"
  };
  
  readonly DEFAULT_ANIMATION_WAITING_TIME = 100;
   
  currentLine: number;
  currentComment: string;
  currentLinesSelection: LinesSelection;
  currentGenerator: any;

  animationHasStarted: boolean = false; 
  animationIsPaused: boolean = false;
  animationHasTerminated: boolean = false;
  animation: any;
  grapher: Grapher;
  codeED: CodeED;
  userFunctions: DynamicFunction[];

  
  @Input() 
  set newCodeED(codeED: CodeED) {
    if(!codeED) return;

    // Check syntax validity of the dynamic code 
    try {
      this.codeED = codeED;
      this.setUpAnimation();
      new Function("grapher", this.tryCatchCode(codeED.executable))(this.grapher);
    } catch(error) {
      this.codeED = null;
      const messageHTML = `
        There is a syntax error in your input code. Please fix it
        before proceeding with the creation of the animation. 
        <br>
        <hr>
        ${error}`;
      printSyntaxError(messageHTML);
    }
  }

  constructor() { }

  setUpAnimation() {
    this.clearAnimation();
    this.buildInitialGraph();
    this.animationHasTerminated = false;
  }

  clearAnimation() {
    this.animationIsPaused = false;
    this.animationHasStarted = false;
    this.currentLine = null;
    this.currentLinesSelection = null;
    this.currentGenerator = null;
    clearTimeout(this.animation);
  }

  buildInitialGraph() {
    const {
      initialValues,
      nodeType, 
      dataStructure
    } = this.codeED;
    this.grapher = new Grapher(nodeType, dataStructure, initialValues);
    this.generateUserFunctionsFromCode();
  }

  // return dynamic code scoped into a try and catch block
  tryCatchCode(code: string): string {
    return `try {${code}} catch(e) { grapher._printError(e) }`;
  }

  // !validateUSerFunctions(userFunctions: DynamicFunction[]) {
  //   userFunctions.forEach(func => {
  //     if (!func.name) {

  //     }
  //     if (!from || !to) {
  //       printSyntaxError(`
  //       For Object
  //       The lines to highlight must be specified");
  //     }
  //     if (typeof from != "number" || typeof to != "number") {
  //       printSyntaxError("The lines to highlight must be specified as Numbers");
  //     }
  //     if (typeof from != "number" || typeof to != "number") {
  //       printSyntaxError("The lines to highlight must be specified as Numbers");
  //     }
  //   });
  // ?}

  generateUserFunctionsFromCode() {
    const executableCode = this.codeED.executable;
    this.userFunctions = new Function("grapher", "type", this.tryCatchCode(executableCode))(this.grapher, InputType);
  } 
  
  hiLine(line: any) {
    this.currentLine = line.line ?? line;
    const lineNumber = this.currentLine - this.currentLinesSelection.start;

    //@ts-ignore
    const comment = line.comment || this.executableLines.toArray()[lineNumber].nativeElement.dataset.comment;
    this.currentComment = comment;
  }

  selectUserFunction(functionIndex: number) {
    const userFunctionsBar = document.getElementById("user-functions");
    const params = userFunctionsBar.querySelectorAll(`[data-function-index='${functionIndex}'] > input`) as any;
    const castedParams = this.castParams(params);
    const userFunction = this.userFunctions[functionIndex];
    this.currentLinesSelection = userFunction.lines;
    this.currentGenerator = userFunction.body(castedParams);
    this.animationHasTerminated = false;
  }
  
  startAnimation() {
    this.animationHasStarted = true;
    this.animationInterval(this.currentGenerator);
  }

  castParams(params: any[]): any[] {
    return [...params].map(param => {
      let value = param.value;
      switch(param.dataset.type) {
        case InputType.Number:
          return Number(value);

        case InputType.NumberList:
          return value.split(",").map(Number);

        case InputType.String:
          return value;

        case InputType.StringList:
          return value.split(",");
      }
    });
  }

  validateInput(datatype: InputType, dataReference: string) {
    const inputElement = (document.querySelector(`[data-index="${dataReference}"]`) as HTMLInputElement)
    let regex: RegExp;
    switch (datatype) {
      case InputType.Number:
        regex = REGEXES.NUMERICAL
      break;

      case InputType.NumberList: 
        regex = REGEXES.NUMERICAL_SERIES
      break;
      
      case InputType.StringList: 
        regex = REGEXES.ANY
      break;
    }
    this.toggleInputValidity(regex, inputElement);
  } 

  toggleInputValidity(regex: RegExp, element: HTMLInputElement) {
    const value = element.value;
    const isValid = regex.test(value);
    if(isValid) {
      element.classList.remove("wrong");
    } else {
      element.classList.add("wrong");
    }
    return isValid;
  }

  animationInterval = (generator: any) => {
    let waitingInterval: number;
    let line = generator.next();
    if (line.done) {
      // generator is done
      this.clearAnimation();
      this.animationHasTerminated = true;
      return;
    } 
    
    if (this.animationIsPaused) {
      // animation is paused, check for awakes
      waitingInterval = this.DEFAULT_ANIMATION_WAITING_TIME;
    } else {
      // animation is running
      this.hiLine(line.value);
      waitingInterval = Number(this.delay.nativeElement.innerHTML);
    }

    this.animation = setTimeout(this.animationInterval, waitingInterval, generator);
  }

  togglePause() {
    this.animationIsPaused = !this.animationIsPaused;
  }
}