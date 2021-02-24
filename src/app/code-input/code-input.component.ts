import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { CodeComment, CodeED } from '../codeInterfaces';
import { DataStructure, NodeType, getNodeFromDataStructure } from '../grapher';

import bubbleSort from '../../assets/templates/bubbleSort.json';

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
  readonly DEFAULT_INITIAL_VALUES = [9, 1, 5, 7, 2, 4, 3]; 
  readonly NUMERICAL_INPUT_REGEX = /^\d+(\.\d){0,1}(\s*\,\s*\d+(\.\d){0,1})*\s*$/;

  readonly editorOptions = {
    mode:  "javascript",
    lineNumbers: true,
    theme: 'material'
  };
  readonly EDITOR_HEIGHT = "450px";

  inputValuesIsValid: boolean = false;
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
    (<HTMLElement>document.querySelector(`.line-code-${lineIndex}`)).focus();
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
    const dataStructureName = (<HTMLSelectElement> document.getElementById("data-structure")).value;
    const dataStructure = DataStructure[dataStructureName];
    const nodeType = getNodeFromDataStructure(dataStructure);
    const config: CodeED = {
      executable: executableCode,
      displayable: filteredDisplayableCode,
      initialValues: initialValues,
      structure: dataStructure,
      nodeType: nodeType
    };
    return config;
  }

  getInitialValues(): any[] {
    if (!this.inputValuesIsValid) {
      throw("The input values are not valid, please fix them and try again");
    }
    // const castToNumber = (<HTMLInputElement> this.numericalInput.nativeElement).checked;
    const valuesAsString = (<HTMLInputElement> this.initialValuesInput.nativeElement).value;
    let valuesAsArray = valuesAsString.split(",")
                                      .map(value => value.trim())
                                      .map(Number);
    // } else {
    //   valuesAsArray.map(value => "\"" + value + "\"");
    // }
    return valuesAsArray || this.DEFAULT_INITIAL_VALUES;
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

  validateInitialValues(inputValues: string = null) {
    const initialValuesInput = <HTMLInputElement> this.initialValuesInput.nativeElement;
    inputValues = inputValues || initialValuesInput.value;
    const dataIsValid = this.NUMERICAL_INPUT_REGEX.test(inputValues);
    if(dataIsValid) {
      initialValuesInput.classList.remove("wrong");
    } else {
      initialValuesInput.classList.add("wrong");
    }
    this.inputValuesIsValid = dataIsValid;
  }

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
  
  removeCommentLines(code: string): string[] {
    // remove comments from code
    const SINGLE_LINE_COMMENT = "//";
    const MULTIPLE_LINE_COMMENT_OPEN = "/*";
    const MULTIPLE_LINE_COMMENT_CLOSE = "*/";
    let isMultipleLineComment = false;
    let uncommentedCode = [];
    const lines = code.split("\n");
    for(let line of lines) {
      const trimmedLine = line.trim();
      // line is the start of a multiple line comment
      if (trimmedLine.startsWith(MULTIPLE_LINE_COMMENT_OPEN)) {
        isMultipleLineComment = true;
      }
      // line is a comment
      if (isMultipleLineComment || trimmedLine.startsWith(SINGLE_LINE_COMMENT)) {
        // line is the end of a multiple line comment
        if (trimmedLine.endsWith(MULTIPLE_LINE_COMMENT_CLOSE)) {
          isMultipleLineComment = false;
        }
        continue;
      }
      // remove empty lines
      if (trimmedLine === "") {
        continue;
      }
      uncommentedCode.push(line);
    }
    return uncommentedCode;
  }

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
    let config = bubbleSort; 
    this.code = config.executable
    this.lines = config.displayable;  
    this.initialValuesAsString = config.initialValues.join(", "); 
    this.validateInitialValues(this.initialValuesAsString);
  }
}

