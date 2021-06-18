import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { DisplayableCodeComment, AnimationConfig } from '../interfaces/codeInterfaces';
import { DataStructure, getNodeFromDataStructure } from '../grapher/grapher';

import "codemirror/addon/hint/show-hint";
import "codemirror/addon/hint/javascript-hint";

import defaultAlertTemplate from '../../assets/templates/defaultAlertTemplate.json';
import { interactionError } from '../errorGenerator';

@Component({
  selector: 'code-input',
  templateUrl: './code-input.component.html',
  styleUrls: ['./code-input.component.scss']
})
export class CodeInputComponent {
  
  @Output() generate = new EventEmitter<AnimationConfig>();
  @ViewChild("codeEditor") codeEditor: any;
  @ViewChild("initialValues", {read: ElementRef}) initialValuesInput: ElementRef;
  @ViewChild("numericalInput", {read: ElementRef}) numericalInput: ElementRef;

  // ! Do not replace INDENT with normal space
  readonly INDENT = " ";
  readonly EMPTY_CODE_COMMENT_LINES = 15;
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

  initialValuesAsString: string;
  initialValuesIsNumerical: boolean = true;
  dataStructureName: string = DataStructure.BarPlot;
  displayableCodeComments: DisplayableCodeComment[];
  editorCode: string;

  constructor(private cdRef: ChangeDetectorRef) {
    this.setUpConfig();
  }

  ngAfterViewInit() {
    this.codeEditor.codeMirror = this.codeEditor.codeMirror;
    this.setCodeEditorSize();
    this.setCodeEditorIntellisense();
  }

  setCodeEditorSize() {
    this.codeEditor.codeMirror.setSize(null, this.EDITOR_HEIGHT);
  }

  setCodeEditorIntellisense() {
    this.codeEditor.codeMirror.on("keyup", (codeMirror, _) => {
      if (!codeMirror.state.completionActive) { 
        this.codeEditor.codeMirror.commands.autocomplete(codeMirror, null, {completeSingle: false});
      }
    });
  }

  setIsNumerical(isNumerical: boolean) {
    this.initialValuesIsNumerical = isNumerical; 
    this.cdRef.detectChanges();
  }

  setDataStructure(dataStructure: string) {
    this.dataStructureName = dataStructure;
    this.cdRef.detectChanges();
  }

  generateEmptyCodeComment(): DisplayableCodeComment {
    return {
      code: "",
      comment: ""
    };
  }

  deleteCodeCommentLine(lineIndex: number) {
      this.displayableCodeComments.splice(lineIndex, 1);
  }

  addCodeCommentLine(lineIndex: number = this.displayableCodeComments.length) {
    window.event.preventDefault();
    const nextLineIndex = lineIndex + 1
    this.displayableCodeComments.splice(nextLineIndex, 0, this.generateEmptyCodeComment());
    window.requestAnimationFrame(() => this.focusOnLine(nextLineIndex));
  }

  focusOnLine(lineIndex: number) {
    (document.querySelector(`.line-code-${lineIndex}`) as HTMLElement).focus();
  }

  getCodeComments(): DisplayableCodeComment[] {
    const codeComments = document.querySelectorAll("#lines-table__body .code-comment-ctn") as any;
    return [...codeComments].map(codeComment => {
      return {
        code: this.extractCodeCommentProperty(codeComment, "code"),
        comment: this.extractCodeCommentProperty(codeComment, "comment")
      };
    });
  }   

  extractCodeCommentProperty(codeCommentTag: HTMLElement, elementName: string) {
    return codeCommentTag.querySelector(`[class^="line-${elementName}"]`).innerHTML;
  }

  getInitialValues(): any[] {
    const valuesAsString = (this.initialValuesInput.nativeElement as HTMLInputElement).value;
    let valuesAsArray: any[] = valuesAsString.split(",")
                                             .map(value => value.trim());
    if (this.initialValuesIsNumerical) {
      valuesAsArray = valuesAsArray.map(Number);
    }
    return valuesAsArray || [];
  }

  getInitialValuesPlaceholder(): string {
    return (this.initialValuesIsNumerical)
      ? "e.g. 1, 5, 2, 6, 8, 3"
      : "e.g. these, are, 4, words";
  }

  removeStyling(event: ClipboardEvent) {
    // Remove styling from pasted code.
    // This is necessary for content-editable elements
    event.preventDefault();
    const pastedCode = event.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, pastedCode);
  }
  
  getExecutableCode(): string {
    const editor = this.codeEditor.codeMirror;
    const rawExecutableCode = editor.getValue();
    const executableCode = rawExecutableCode;
    return executableCode;
  }

  getConfig(): AnimationConfig {
    const executable = this.getExecutableCode();
    const displayableCodeComments = this.getCodeComments();
    const initialValues = this.getInitialValues();
    const dataStructure = DataStructure[this.dataStructureName];
    const nodeType = getNodeFromDataStructure(dataStructure);
    const config: AnimationConfig = {
      executable,
      displayableCodeComments,
      initialValues,
      dataStructure,
      nodeType
    };
    return config;
  }

  generateAnimation() {
    const config = this.getConfig();
    this.generate.emit(config);
  }

  downloadConfig() {
    const config = this.getConfig();
    const a = document.createElement("a");
    const file = new Blob([JSON.stringify(config)], { type: "text/json" });
    a.href = URL.createObjectURL(file);
    a.download = "grapher_config.json";
    a.click();
  }

  setUpConfig(config: AnimationConfig = defaultAlertTemplate) {
    this.editorCode = config.executable
    this.displayableCodeComments = config.displayableCodeComments;  
    this.initialValuesAsString = config.initialValues.join(", "); 
  }

  loadConfig(event: Event) {
    const loadableFile = (event.target as HTMLInputElement).files[0];
    const fileReader = new FileReader();
    fileReader.onload = fileLoadedEvent => {
      const configFile = fileLoadedEvent.target.result as string;
      try {
        this.setUpConfig(JSON.parse(configFile));
      } catch {
        interactionError("The file is not valid");
      }
    };
    fileReader.readAsText(loadableFile, "UTF-8");
  }
}

