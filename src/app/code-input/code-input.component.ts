import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { CodeComment, CodeED } from '../interfaces/codeInterfaces';
import { DataStructure, getNodeFromDataStructure } from '../grapher';

import "codemirror/addon/hint/show-hint";
import "codemirror/addon/hint/javascript-hint";

import queue from '../../assets/templates/queue.json';

@Component({
  selector: 'code-input',
  templateUrl: './code-input.component.html',
  styleUrls: ['./code-input.component.scss']
})
export class CodeInputComponent {
  
  @Output() generate = new EventEmitter<CodeED>();
  @ViewChild("codeEditor") codeEditor;
  @ViewChild("initialValues", {read: ElementRef}) initialValuesInput: ElementRef;
  @ViewChild("numericalInput", {read: ElementRef}) numericalInput: ElementRef;

  readonly CODE_PLACEHOLDER = "insert code here";
  readonly COMMENT_PLACEHOLDER = "insert comment here";
  // readonly NUMERICAL_SERIES_INPUT_REGEX = /^\d+(\.\d){0,1}(\s*\,\s*\d+(\.\d){0,1})*\s*$/;

  readonly editorOptions = {
    mode:  "javascript",
    lineNumbers: true,
    theme: 'material',
    autoCloseTags: true,
    lineWrapping: true,
    smartIndent: true,
    extraKeys: {'Ctrl-Space': 'autocomplete'}
  };
  readonly EDITOR_HEIGHT = "450px";

  // inputValuesIsValid: boolean = false;
  initialValuesAsString: string = "";

  code: string = `/** 
*  Use this space to write the logic of the program, i.e. the javascript function 
*  that operates the algorithm. Use the "yield" keyword to tell the program 
*  which line to highlight at each stage.
* e.g.
*      yield 0 
*  This will highlight the 0th line (remember the program uses the array notation,
*  so the first element is the element at position 0)
* 
*  It is possible to return dynamic comments, for example if a the comment
*  depends on the value of a variable. In such case use the keyword yield to return
*  a JSON object of the form:
*  yield {
*      line: 0,
*      comment: "checking if element " + x + " >= " + y
*  }
* 
*  Write only the body of the function, do NOT include the function head
*  Avoid using comments and code on the same line as this would create a parsing issue
*  eg.
*     ==== GOOD ====
*      //increment counter
*      i = i + 1
*     
*     ==== BAD ====
*      i = i + 1 //increment counter
*/ 


// highlight the function call
yield 0

let a = 34
let c = 16

// highlight the console.log()
yield {
    line: 1, 
    comment: "printing a + c = " + (a + c)
} 
console.log("Hello, World!");

// highlight the end of the function
yield 2


`;

  lines: CodeComment[] = [];
  delay = 1000;

  constructor() {
    this.lines = [
      {
        code: 'function example()', 
        comment: ''
      },
      {
        code: '&emsp;console.log("Hello, World!");', 
        comment: ''
      },
      {
        code: '}', 
        comment: ''
      },
    ];

    const EMPTY_LINES = 15;
    Array(EMPTY_LINES).fill(0).forEach(_ => this.lines.push({
      code: '', 
      comment: ''
    }));
  }

  // Correctly set the size of the code editor
  ngAfterViewInit() {
    this.codeEditor.codeMirror.setSize(null, this.EDITOR_HEIGHT);
    this.codeEditor.codeMirror.on("keyup", function (cm, event) {
      if (!cm.state.completionActive && /*Enables keyboard navigation in autocomplete list*/
          event.keyCode != 13) {        /*Enter - do not open autocomplete list just after item has been selected in it*/ 
            this.codeEditor.codeMirror.commands.autocomplete(cm, null, {completeSingle: false});
      }
  });
  }

  deleteCodeCommentLine(lineIndex: number) {
      this.lines.splice(lineIndex, 1);
  }

  addCodeCommentLine(lineIndex: number = this.lines.length) {
    window.event.preventDefault();
    const nextLineIndex = lineIndex + 1
    this.lines.splice(nextLineIndex, 0, {
      code: '',
      comment: ''
    });
    window.requestAnimationFrame(() => this.focusOnLine(nextLineIndex));
  }

  focusOnLine(lineIndex: number) {
    (document.querySelector(`.line-code-${lineIndex}`) as HTMLElement).focus();
  }

  indentCode(lineIndex: number, inverse=false) {
    window.event.preventDefault();

    // ! Do not replace INDENT with normal space
    const INDENT = " ";
    let line = document.querySelector(`.line-code-${lineIndex}`);
    if(inverse) {
      if(line.innerHTML.startsWith(INDENT)) {
        line.innerHTML = line.innerHTML.replace(INDENT, "");
      }
    } else {
      line.innerHTML = INDENT + line.innerHTML;
    }
  }

  getCodeCommentLines(): CodeComment[] {
    const lines = document.querySelectorAll("#lines-table__body .code-comment-ctn") as any;
    return [...lines].map(line => {
      return {
        code: this.extractLineValue(line, "code"),
        comment: this.extractLineValue(line, "comment")
      };
    });
  }   

  extractLineValue(parent: HTMLElement, elementName: string) {
    return parent.querySelector(`[class^="line-${elementName}"]`).innerHTML;
  }

  getConfig(): CodeED {
    const executableCode = this.getExecutableCode();
    const filteredDisplayableCode = this.getFilteredDisplayableCode();
    const initialValues = this.getInitialValues();
    const dataStructureName = (document.getElementById("data-structure") as HTMLSelectElement).value;
    const dataStructure = DataStructure[dataStructureName];
    const nodeType = getNodeFromDataStructure(dataStructure);
    const config: CodeED = {
      executable: executableCode,
      displayable: filteredDisplayableCode,
      initialValues: initialValues,
      dataStructure: dataStructure,
      nodeType: nodeType
    };
    return config;
  }

  getInitialValues(): any[] {
    // if (!this.inputValuesIsValid) {
    //   throw("The input values are not valid, please fix them and try again");
    // }
    const valuesAsString = (this.initialValuesInput.nativeElement as HTMLInputElement).value;
    let valuesAsArray = valuesAsString.split(",")
                                      .map(value => value.trim())
                                      .map(Number);
    return valuesAsArray || [];
  }

  getCodeED() {
    const config = this.getConfig();
    this.generate.emit(config);
  }

  getFilteredDisplayableCode(): CodeComment[] {
    const lines = this.getCodeCommentLines();
    return lines.map(this.deletePlaceholders)
                     .filter(this.codeCommentBlockIsRemovable)
                     .map(this.sanitiseCodeCommentBlock)
  }
  
  sanitiseCodeCommentBlock = ({code, comment}): CodeComment => {
    return {
      code: this.sanitiseText(code),
      comment: this.sanitiseText(comment),
    };
  }

  sanitiseText = (text: string): string => {
    //@ts-ignore
    return text.replaceAll("<", "&lt;").replaceAll(">", "&gt;")
  }

  deletePlaceholders = ({code, comment}: CodeComment): CodeComment => {
    if (code === this.CODE_PLACEHOLDER) code = "";
    if (comment === this.COMMENT_PLACEHOLDER) comment = "";
    return {
      code,
      comment
    };
  }

  codeCommentBlockIsRemovable({code}: CodeComment): boolean {
    return code !== "";
  }

  // validateInitialValues(inputValues: string = null) {
  //   readonly NUMERICAL_SERIES_INPUT_REGEX = /^\d+(\.\d){0,1}(\s*\,\s*\d+(\.\d){0,1})*\s*$/;
  //   const initialValuesInput = this.initialValuesInput.nativeElement as HTMLInputElement;
  //   inputValues = inputValues || initialValuesInput.value;
  //   const dataIsValid = this.NUMERICAL_SERIES_INPUT_REGEX.test(inputValues);
  //   if(dataIsValid) {
  //     initialValuesInput.classList.remove("wrong");
  //   } else {
  //     initialValuesInput.classList.add("wrong");
  //   }
  //   this.inputValuesIsValid = dataIsValid;
  // }

  getExecutableCode(): string {
    const editor = this.codeEditor.codeMirror;
    const rawExecutableCode = editor.getValue();
    // TODO: decide whether to remove comments
    // console.log(rawExecutableCode)
    // const uncommentedExecutableCode = this.removeCommentLines(rawExecutableCode);
    // const executableCode = uncommentedExecutableCode.join("\n");
    const executableCode = rawExecutableCode;
    return executableCode;
  }
  
  // removeCommentLines(code: string): string[] {
  //   // remove comments from code
  //   const SINGLE_LINE_COMMENT = "//";
  //   const MULTIPLE_LINE_COMMENT_OPEN = "/*";
  //   const MULTIPLE_LINE_COMMENT_CLOSE = "*/";
  //   let isMultipleLineComment = false;
  //   let uncommentedCode = [];
  //   const lines = code.split("\n");
  //   for(let line of lines) {
  //     const trimmedLine = line.trim();
  //     // line is the start of a multiple line comment
  //     if (trimmedLine.startsWith(MULTIPLE_LINE_COMMENT_OPEN)) {
  //       isMultipleLineComment = true;
  //     }
  //     // line is a comment
  //     if (isMultipleLineComment || trimmedLine.startsWith(SINGLE_LINE_COMMENT)) {
  //       // line is the end of a multiple line comment
  //       if (trimmedLine.endsWith(MULTIPLE_LINE_COMMENT_CLOSE)) {
  //         isMultipleLineComment = false;
  //       }
  //       continue;
  //     }
  //     // remove empty lines
  //     if (trimmedLine === "") {
  //       continue;
  //     }
  //     uncommentedCode.push(line);
  //   }
  //   return uncommentedCode;
  // }

  downloadConfig() {
    const config = this.getConfig();
    const a = document.createElement("a");
    const file = new Blob([JSON.stringify(config)], { type: "text/json" });
    a.href = URL.createObjectURL(file);
    a.download = "animator_config.json";
    a.click();
  }

  loadConfig() {
    // TODO make this dynamic
    // const config = JSON.parse("file")   
    let config = queue; 
    this.code = config.executable
    this.lines = config.displayable;  
    this.initialValuesAsString = config.initialValues.join(", "); 
    // this.validateInitialValues(this.initialValuesAsString);
  }
}

