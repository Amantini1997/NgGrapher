import { Options } from '@angular-slider/ngx-slider';
import { Component, ElementRef, Input, QueryList, ViewChild, ViewChildren } from '@angular/core';
// import { AnimatorComponent } from '../animator/animator.component';
import { AnimationConfig } from '../interfaces/codeInterfaces';
import { DynamicFunction, InputType, LinesSelection, REGEXES } from '../interfaces/dynamicFunctions';
import { Grapher } from '../grapher';
import { printRuntimeError, printSyntaxError } from '../errorGenerator';

@Component({
  selector: 'code-output',
  templateUrl: './code-output.component.html',
  styleUrls: ['./code-output.component.scss']
})
export class CodeOutputComponent {

  @ViewChildren("codeCommentLine") codeCommentLines: QueryList<ElementRef>;
  @ViewChild("delay", {read: ElementRef}) delay: ElementRef;

  // readonly GeneratorFunction = Object.getPrototypeOf(function*(){}).constructor;
  readonly value: number = 1000;
  readonly options: Options = {
      floor: 100,
      ceil: 2500
  };
  
  readonly DEFAULT_ANIMATION_WAITING_TIME = 100;
   
  currentLine: number;
  currentLinesSelection: LinesSelection;
  currentComment: string;
  currentUserFunction: string;
  currentGenerator: Generator;
  
  animationHasStarted: boolean = false; 
  animationIsPaused: boolean = false;
  animation: any;
  grapher: Grapher;
  config: AnimationConfig;
  userFunctions: DynamicFunction[];

  constructor() { }

  @Input() 
  set newConfig(config: AnimationConfig) {
    if(!config) return;

    // Check syntax validity of the dynamic code 
    try {
      this.config = config;
      this.setUpAnimation();
      new Function("grapher", this.tryCatchCode(config.executable))(this.grapher);
    } catch(error) {
      this.config = null;
      const messageHTML = `
        There is a syntax error in your input code. Please fix it
        before proceeding with the creation of the animation. 
        <br>
        <hr>
        ${error}`;
      printSyntaxError(messageHTML);
    }
  }

  clearAnimation() {
    this.animationIsPaused = false;
    this.animationHasStarted = false;
    this.currentLine = null;
    this.currentGenerator = null;
    this.currentUserFunction = null;
    clearTimeout(this.animation);
  }

  setUpAnimation() {
    this.clearAnimation();
    this.buildInitialGraph();
  }
  
  startAnimation() {
    this.animationHasStarted = true;
    this.animationInterval(this.currentGenerator);
  }

  togglePause() {
    this.animationIsPaused = !this.animationIsPaused;
  }

  buildInitialGraph() {
    const {
      initialValues,
      nodeType, 
      dataStructure
    } = this.config;
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
    const executableCode = this.config.executable;
    this.userFunctions = new Function("grapher", "type", this.tryCatchCode(executableCode))(this.grapher, InputType);
  } 
  
  highlightLine(line: any) {
    this.currentLine = line.line ?? line;

    // line index in the codeComment block
    const lineNumber = this.currentLine - this.currentLinesSelection.start;

    const codeCommentLine = this.codeCommentLines.toArray()[lineNumber]; 
    this.currentComment = line?.comment ?? codeCommentLine.nativeElement.dataset.comment;
  }

  selectUserFunction(functionIndex: number) {
    const inputs = this.getInputsForFunction(functionIndex);
    const castedParams = this.castInputValues(inputs);
    const userFunction = this.userFunctions[functionIndex];
    this.currentUserFunction = userFunction.name;
    this.currentLinesSelection = userFunction.lines;
    this.currentGenerator = userFunction.body(castedParams);
  }

  getInputsForFunction(functionIndex: number): HTMLInputElement[] {
    const userFunctionsBar = document.getElementById("user-functions");
    return userFunctionsBar.querySelectorAll(`[data-function-index='${functionIndex}'] > input`) as any;
  }

  castInputValues(inputs: HTMLInputElement[]): any | any[] {
    return [...inputs].map(input => {
      let value = input.value;
      switch(input.dataset.type) {
        case InputType.Number:
          return Number(value);

        case InputType.NumberList:
          return value.split(",").map(Number);

        case InputType.String:
          return value;

        case InputType.StringList:
          return value.split(",");
      }
    })[0];
  }

  functionInputsAreValid(functionIndex: number): boolean{
    const inputs = this.getInputsForFunction(functionIndex) as any;
    return [...inputs].map(this.inputIsValid).every(input => input);
  }

  inputIsValid(input: HTMLInputElement): boolean {
    let regex: RegExp;
    const datatype = input.dataset.type;
    const value = input.value; 

    if (value === "") return false;

    switch (datatype) {
      case InputType.Number:
        regex = REGEXES.NUMERICAL;
      break;

      case InputType.NumberList: 
        regex = REGEXES.NUMERICAL_SERIES;
      break;

      case InputType.String:
      case InputType.StringList: 
        return true;
    }
    return regex.test(value);
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

  animationInterval = (generator: Generator) => {
    let waitingInterval: number;
    
    if (this.animationIsPaused) {
      // animation is paused, check for awakes
      waitingInterval = this.DEFAULT_ANIMATION_WAITING_TIME;
    } else {
      // animation is running, execute next line
      let line = generator.next();
      if (line.done) {
        // generator is done
        this.clearAnimation();
        return;
      } 
      try {
        this.highlightLine(line.value);
      } catch (error) {
        printRuntimeError(error.message)
      }
      waitingInterval = Number(this.delay.nativeElement.innerHTML);
    }

    this.animation = setTimeout(this.animationInterval, waitingInterval, generator);
  }
}