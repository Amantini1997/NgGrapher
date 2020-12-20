import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { CodeComment, CodeED } from '../codeInterfaces';

@Component({
  selector: 'code-input',
  templateUrl: './code-input.component.html',
  styleUrls: ['./code-input.component.scss']
})
export class CodeInputComponent {
  
  @Output() generate = new EventEmitter<CodeED>();

  @ViewChild("codeCommentBlocksContainer", {read: ElementRef}) codeCommentBlocksContainer: ElementRef;
  @ViewChild("codeCommentBlock", {read: ElementRef}) codeContainer: ElementRef;
  @ViewChild("codeEditor") codeEditor;

  readonly CODE_PLACEHOLDER = "insert code here";
  readonly COMMENT_PLACEHOLDER = "insert comment here";

  readonly editorOptions = {
    mode:  "javascript",
    lineNumbers: true,
    theme: 'material'
  };

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
    
    const LINE_DYNAMIC_COMMENT = "console.log()";
    // highlight the console.log()
    yield {
        line: 1, 
        comment: "printing " + LINE_DYNAMIC_COMMENT
    } 
    console.log("Hello, World!");
    
    // highlight the end of the function
    yield 2`;


  lines: CodeComment[] = [];

  delay = 1000;
  dataInput = [9, 1, 5, 7, 2, 4, 3]; // TODO make this dynamic
  // codeMirror: CodemirrorComponent;


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
  }

  deleteCodeCommentLine(lineIndex: number): void {
      this.lines.splice(lineIndex, 1);
  }

  addCodeCommentLine(): void {
    this.lines.push({
      code: '',
      comment: ''
    });
  }

  indentCode(lineIndex: number, inverse=false): void {
    window.event.preventDefault();
    const INDENT = "&emsp;";
    let line = this.lines[lineIndex];
    if(inverse) {
      if(line.code.startsWith(INDENT)) {
        line.code = line.code.replace(INDENT, "");
      }
    } else {
      line.code = INDENT + line.code;
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
    return parent.querySelector(`.line-${elementName}`).innerHTML;
  }

  getCodeED(): void {
    const executableCode = this.getExecutableCode();
    const filteredDisplayableCode = this.getFilteredDisplayableCode();
    const output: CodeED = {
      executable: executableCode,
      displayable: filteredDisplayableCode
    };
    this.generate.emit(output);
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
    const uncommentedExecutableCode = this.removeCommentLines(rawExecutableCode);
    const executableCode = uncommentedExecutableCode.join("\n");
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
}
