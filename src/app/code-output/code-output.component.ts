import { Options } from '@angular-slider/ngx-slider';
import { Component, ElementRef, Input, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { AnimationConfig } from '../interfaces/codeInterfaces';
import { DynamicFunction, InputType, LinesSelection, REGEXES } from '../interfaces/dynamicFunctionsInterfaces';
import { Grapher } from '../grapher/grapher';
import { printRuntimeError, printSyntaxError } from '../errorGenerator';

@Component({
  selector: 'code-output',
  templateUrl: './code-output.component.html',
  styleUrls: ['./code-output.component.scss']
})
export class CodeOutputComponent {

  @ViewChildren("codeCommentLine") codeCommentLines: QueryList<ElementRef>;
  @ViewChild("delay", {read: ElementRef}) delay: ElementRef;

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
    this.config = config;
    this.setUpAnimation();

    // Check syntax validity of the dynamic code 
    try {
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

  clearDisplayedCode() {
    this.currentLinesSelection = null;
  }

  clearAnimation() {
    this.animationIsPaused = false;
    this.animationHasStarted = false;
    this.currentComment = "";
    this.currentLine = null;
    this.currentGenerator = null;
    this.currentUserFunction = null;
    clearTimeout(this.animation);
  }

  setUpAnimation() {
    this.clearDisplayedCode();
    this.clearAnimation();
    this.buildInitialGraph();
  }
  
  startAnimation() {
    this.animationHasStarted = true;
    this.executeGenerator(this.currentGenerator);
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

  generateUserFunctionsFromCode() {
    const executableCode = this.config.executable;
    this.userFunctions = new Function("grapher", this.tryCatchCode(executableCode))(this.grapher);
  } 
  
  highlightLine(line: any) {
    this.currentLine = line.line ?? line;

    // line index in the codeComment block
    const lineNumber = this.currentLine - this.currentLinesSelection.start;
    let codeCommentLine = this.codeCommentLines.toArray()[lineNumber]; 
    try {
      this.currentComment = line?.comment ?? codeCommentLine.nativeElement.dataset.comment;
    } catch(error) {
      throw `Line ${lineNumber} does on exist in the code-comment block`;
    }
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

  executeGenerator = (generator: Generator) => {
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
        printRuntimeError(error);
        this.clearAnimation();
        return;
      }
      waitingInterval = Number(this.delay.nativeElement.innerHTML);
    }

    // store the timeout object to clear it when generator is done
    this.animation = setTimeout(this.executeGenerator, waitingInterval, generator);
  }
}