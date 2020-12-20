import { Component, Input } from '@angular/core';
import { CodeED, YieldedLine } from '../codeInterfaces';

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

  @Input() codeED: CodeED;
  constructor() { }

  generateJsFunctionFromCode(): Generator {
    return new this.GeneratorFunction(this.codeED)();
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
    this.delay = +delaySlide.value;
  }

  play(): void {
    this.animationIsPaused = false;
  }

  stop(): void {
    this.animationIsPaused = true;
  }

  // generateCode() {
  //   const rawLines = getRawLines()
  //   const codeContainer = document.getElementById("code-highlighter")
  //   codeContainer.innerHTML = ""
  //   rawLines.forEach((line, index) => {
  //       const codeNode = line.querySelector(".line-code")
  //       const code = (codeNode.innerHTML === codeNode.dataset.placeholder) ? "" : codeNode.innerHTML
  //       const commentNode = line.querySelector(".line-comment")
  //       const comment = (commentNode.innerHTML === commentNode.dataset.placeholder) ? "" : commentNode.innerHTML
  //       if (code) {
  //           const codeLine = document.createElement("div")
  //           codeLine.classList.add(`code-line-${index}`)
  //           codeLine.innerHTML = code
  //           codeLine.dataset.comment = comment
  //           codeContainer.appendChild(codeLine)  
  //       }              
  //   })
  // }

}
