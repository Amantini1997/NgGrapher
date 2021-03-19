import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { CodeComment, CodeED } from '../interfaces/codeInterfaces';
import { DataStructure, getNodeFromDataStructure } from '../grapher';

import "codemirror/addon/hint/show-hint";
import "codemirror/addon/hint/javascript-hint";

import bubbleSort from '../../assets/templates/bubbleSort.json';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';

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

  // ! Do not replace INDENT with normal space
  readonly INDENT = " ";
  readonly DISPLAY_CODE_EMPTY_LINES = 15;
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

  initialValuesAsString: string = "";
  lines: CodeComment[] = [];
  editorCode: string = `/** 
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
* Remember to include the return array of the functions 
* that the user can interact with.
*/ 


// highlight the function call
return [
  {
    name: "alert",
    body: alerting,
    params: [
      {
        name: "message to alert",
        type: "string"
      }
    ],
    lines: {
      start: 0,
      end: 2
    }
  }
]; 

function * alerting(message) {
  yield 0

  // highlight the alert()
  yield {
      line: 1, 
      comment: "alerting message '" + message + "'"
  } 
  alert(message);

  // highlight the end of the function
  yield 2
}
`;

  constructor() {
    this.lines = [
      {
        code: 'function alert(message)', 
        comment: ''
      },
      {
        code: '&emsp;alert(message);', 
        comment: ''
      },
      {
        code: '}', 
        comment: ''
      },
    ];
    Array(this.DISPLAY_CODE_EMPTY_LINES).fill(0)
        .forEach(_ => this.lines.push(this.generateEmptyCodeComment()));
  }

  // Set the size of the code editor
  ngAfterViewInit() {
    this.codeEditor.codeMirror = this.codeEditor.codeMirror;
    this.setCodeEditorSize();
  }

  setCodeEditorSize() {
    this.codeEditor.codeMirror.setSize(null, this.EDITOR_HEIGHT);
    this.codeEditor.codeMirror.on("keyup", (codeMirror, event) => {
      if (!codeMirror.state.completionActive && /*Enables keyboard navigation in autocomplete list*/
          event.keyCode != 13) {        /*Enter - do not open autocomplete list just after item has been selected in it*/ 
            this.codeEditor.codeMirror.commands.autocomplete(codeMirror, null, {completeSingle: false});
      }
    });
  }

  generateEmptyCodeComment(): CodeComment {
    return {
      code: "",
      comment: ""
    };
  }

  deleteCodeCommentLine(lineIndex: number) {
      this.lines.splice(lineIndex, 1);
  }

  addCodeCommentLine(lineIndex: number = this.lines.length) {
    window.event.preventDefault();
    const nextLineIndex = lineIndex + 1
    this.lines.splice(nextLineIndex, 0, this.generateEmptyCodeComment());
    window.requestAnimationFrame(() => this.focusOnLine(nextLineIndex));
  }

  focusOnLine(lineIndex: number) {
    (document.querySelector(`.line-code-${lineIndex}`) as HTMLElement).focus();
  }

  indentCode(lineIndex: number, inverse=false) {
    window.event.preventDefault();
    let line = document.querySelector(`.line-code-${lineIndex}`) as HTMLDivElement;
    if(inverse) {
      if(line.innerHTML.startsWith(this.INDENT)) {
        line.innerHTML = line.innerHTML.replace(this.INDENT, "");
      }
    } else {
      line.innerHTML = this.INDENT + line.innerHTML;
      this.moveCaret(this.INDENT.length, line);
    }
  }
  
  moveCaret(positionShift: number, line: HTMLDivElement) {    
    const range = document.createRange();
    const sel = window.getSelection();
    const offset = sel.focusOffset;
    range.setStart(line, offset + positionShift);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
  }

  getCodeCommentLines(): CodeComment[] {
    const lines = document.querySelectorAll("#lines-table__body .code-comment-ctn") as any;
    return [...lines].map(line => {
      return {
        code: this.extractLineProperty(line, "code"),
        comment: this.extractLineProperty(line, "comment")
      };
    });
  }   

  extractLineProperty(parent: HTMLElement, elementName: string) {
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
    return lines.map(this.sanitiseCodeCommentBlock);
  }
  
  sanitiseCodeCommentBlock = ({code, comment}): CodeComment => {
    return {
      code: this.sanitiseText(code),
      comment: this.sanitiseText(comment),
    };
  }

  sanitiseText = (text: string): string => {
    // @ts-ignore
    return text.replaceAll("<", "&lt;").replaceAll(">", "&gt;")
  }
  
  getExecutableCode(): string {
    const editor = this.codeEditor.codeMirror;
    const rawExecutableCode = editor.getValue();
    const executableCode = rawExecutableCode;
    return executableCode;
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
    this.editorCode = config.executable
    this.lines = config.displayable;  
    this.initialValuesAsString = config.initialValues.join(", "); 
  }
}

