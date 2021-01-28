import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { CodeComment, CodeED } from '../codeInterfaces';
import { DataStructure, NodeType } from '../grapher';

import bubbleSort from '../../assets/templates/bubbleSort.json';

@Component({
  selector: 'code-input',
  templateUrl: './code-input.component.html',
  styleUrls: ['./code-input.component.scss']
})
export class CodeInputComponent {
  
  @Output() generate = new EventEmitter<CodeED>();
  @ViewChild("codeEditor") codeEditor;

  readonly CODE_PLACEHOLDER = "insert code here";
  readonly COMMENT_PLACEHOLDER = "insert comment here";

  readonly editorOptions = {
    mode:  "javascript",
    lineNumbers: true,
    theme: 'material'
  };
  readonly EDITOR_HEIGHT = "450px";

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
  // TODO make this dynamic
  initialValues = [9, 1, 5, 7, 2, 4, 3]; 


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
      console.log("+" + line.innerHTML + "+", line.innerHTML.startsWith(INDENT))
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
    const config: CodeED = {
      executable: executableCode,
      displayable: filteredDisplayableCode,
      initialValues: this.initialValues,
      // TODO make these dynamic
      nodeType: NodeType.Bar,
      structure: DataStructure.BarPlot
    };
    return config;
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
    // let config =
    // {"executable":"let inputArr = grapher.getNodes().map(node => node.value);\n\nlet len = inputArr.length;\n\nfor (let i = 0; i < len; i++) {\n\tyield {\n      line: 0,\n      comment: (i < len) \n      \t\t\t\t\t? i + \" < \" + len + \", so we stay in the loop\"\n    \t\t\t\t\t: i + \" is = to \" + len + \", so we exit the loop\"\n    }\n  \n  \tfor (let j = 0; j < len - 1; j++) {\n        yield {\n          line: 1,\n          comment: (j < len-1) \n      \t\t\t\t\t? j + \" < \" + len + \", so we stay in the loop\"\n    \t\t\t\t\t: j+ \" is = to \" + len + \", so we exit the loop\"\n        }\n      \n    \tif (inputArr[j] > inputArr[j + 1]) {\n      \t\tyield {\n\t\t\t\tline: 2,\n                comment: inputArr[j] + \" > \" + inputArr[j + 1]\n            }\n          \n      \t\tlet tmp = inputArr[j];\n      \t\tyield 3\n      \t\t\n          \tinputArr[j] = inputArr[j + 1];\n\t\t\tyield 4\n\t\t\t\n          \tinputArr[j + 1] = tmp;\n            grapher.swap(j, j+1);\n            yield 5\n        }\n    }\n}\nyield 9\n","displayable":[{"code":"for (let i = 0; i &lt; len; i++) {","comment":"Checking index i is in range"},{"code":"&nbsp; &nbsp; for (let j = 0; j &lt; len; j++) { ","comment":"Checking index j is in range"},{"code":"&nbsp; &nbsp; &nbsp; &nbsp;&nbsp;if (inputArr[j] &gt; inputArr[j + 1]) {","comment":"if the element at index j + 1 is bigger than the element at index j:"},{"code":"&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; let tmp = inputArr[j];","comment":"swap the variables"},{"code":"&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; inputArr[j] = inputArr[j + 1];","comment":"swap the variables"},{"code":"&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; inputArr[j + 1] = tmp;","comment":"swap the variables"},{"code":"&nbsp; &nbsp; &nbsp; &nbsp; }","comment":""},{"code":"&nbsp; &nbsp; }","comment":""},{"code":"}","comment":""},{"code":"&nbsp;","comment":"Done! Array is sorted :)"}],"initialValues":[9,1,5,7,2,4,3],"nodeType":"Bar","structure":"BarPlot"}
    
    this.code = config.executable
    this.lines = config.displayable;   
  }
}
