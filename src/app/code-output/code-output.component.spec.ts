import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AnimationConfig } from '../interfaces/codeInterfaces';
import { DynamicFunction, InputType } from '../interfaces/dynamicFunctionsInterfaces';
import { DataStructure, NodeType } from '../interfaces/grapherInterfaces';

import { CodeOutputComponent } from './code-output.component';
import { By } from '@angular/platform-browser';

xdescribe('CodeOutputComponent', () => {
  let component: CodeOutputComponent;
  let fixture: ComponentFixture<CodeOutputComponent>;
  
  // @ts-ignore
  let mockGeneratorFunction: GeneratorFunction = function * () { 
    let generator: Generator;
    yield generator;
  };

  const code0 = "code 0";
  const comment0 = "comment 0";

  const code1 = "code 1";
  const comment1 = "comment 1";

  let mockDynamicFunction: DynamicFunction = {
    name: "Mock Function",
    body: mockGeneratorFunction,
    params: [
      {
        name: "uselessParam",
        type: InputType.String
      }
    ],
    lines: {
      start: 0,
      end: 2
    }
  }

  let mockConfig: AnimationConfig = {
    executable: `return [
      {
        name: "${mockDynamicFunction.name}",
        body: emptyGenerator,
        params: [
          {
            name: "${mockDynamicFunction.params[0].name}",
            type: "${mockDynamicFunction.params[0].type}"
          }
        ],
        lines: {
          start: ${mockDynamicFunction.lines.start},
          end: ${mockDynamicFunction.lines.end}
        }
      }
    ]; 
    
    function * emptyGenerator(input) {
      yield 0
      yield {
        line: 0,
        comment: input
      }
    }
    `,
    displayableCodeComments: [
      {
        code: code0,
        comment: comment0
      },
      {
        code: code1,
        comment: comment1
      }
    ],
    initialValues: [],
    nodeType: NodeType.Bar,
    dataStructure: DataStructure.BarPlot
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CodeOutputComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CodeOutputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function buildMockAnimation() {
    component.newConfig = mockConfig;
    fixture.detectChanges();
  }

  function loadMockFunction(input?: any) {
    const mockFunction = fixture.debugElement.query(By.css('[data-function-index="0"]')).nativeElement;
    const mockFunctionButton = mockFunction.querySelector("button");
    if (input) {
      mockFunction.querySelector("input").value = input;
      fixture.detectChanges();
    }
    mockFunctionButton.click();
    fixture.detectChanges();
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it("upon creation all the fields should be falsy", () => {
    expect(component.currentLine).toBeUndefined();
    expect(component.currentLinesSelection).toBeUndefined();
    expect(component.currentComment).toBeUndefined();
    expect(component.currentGenerator).toBeUndefined();
    expect(component.currentUserFunction).toBeUndefined();
    expect(component.animationIsPaused).toBeFalse();
    expect(component.animationHasStarted).toBeFalse();
    expect(component.animation).toBeUndefined();
    expect(component.grapher).toBeUndefined();
    expect(component.config).toBeUndefined();
  });

  it("generateUserCode should correctly set user functions", () => {
    buildMockAnimation();
    expect(component.userFunctions[0].name).toEqual(mockDynamicFunction.name);
    expect(component.userFunctions[0].params).toEqual(mockDynamicFunction.params);
    expect(component.userFunctions[0].lines).toEqual(mockDynamicFunction.lines);
  });

  it("interactive functions without correct input should be disabled", () => {
    spyOn(component, "selectUserFunction");
    buildMockAnimation();
    loadMockFunction();
    expect(component.selectUserFunction).not.toHaveBeenCalled();
  });

  it("START button should be disabled if an interactive function is not selected", () => {
    spyOn(component, "startAnimation");
    buildMockAnimation();
    const startButton = fixture.debugElement.query(By.css('#player > div > button')).nativeElement;
    startButton.click();
    expect(component.startAnimation).not.toHaveBeenCalled();
  });

  it("START button should be enabled if an interactive function is selected", () => {
    spyOn(component, "startAnimation");
    buildMockAnimation();
    loadMockFunction("0");
    const startButton = fixture.debugElement.query(By.css('#player > div > button')).nativeElement;
    startButton.click();
    expect(component.startAnimation).toHaveBeenCalled();
  });

  it("highlightLine should load displayable code", () => {
    buildMockAnimation();
    loadMockFunction("0");
    const codeHighlighter = fixture.debugElement.query(By.css('.code-highlighter'));
    expect(codeHighlighter.nativeElement.textContent).toBeTruthy();
  });

  it("highlightLine should highlight the selected line", () => {
    buildMockAnimation();
    loadMockFunction("0");

    component.highlightLine(0);
    fixture.detectChanges();
    const codeHighlighter = fixture.debugElement.query(By.css('.code-highlighter > .highlight'));
    alert(codeHighlighter.nativeElement + codeHighlighter.nativeElement.textContent)
    expect(codeHighlighter.nativeElement.textContent.trim()).toEqual(code0);
  });

  it("highlightLine should display the selected comment", () => {
    buildMockAnimation();
    loadMockFunction("0");
    component.highlightLine(0);
    fixture.detectChanges();
    const commentBox = fixture.debugElement.query(By.css('.comment-box'));
    expect(commentBox.nativeElement.textContent.trim()).toEqual(comment0); 
  });

  it("highlightLine should display dynamic comments if present", () => {
    const DYNAMIC_COMMENT = "dynamic comment";
    buildMockAnimation();
    loadMockFunction("0");
    component.highlightLine({
      line: 0,
      comment: DYNAMIC_COMMENT
    });
    fixture.detectChanges();
    const commentBox = fixture.debugElement.query(By.css('.comment-box'));
    expect(commentBox.nativeElement.textContent.trim()).not.toEqual(comment0); 
    expect(commentBox.nativeElement.textContent.trim()).toEqual(DYNAMIC_COMMENT); 
  });

  it("selecting a new configuration should remove displayable code", () => {
    buildMockAnimation();
    loadMockFunction("0");    
    buildMockAnimation();
    const codeHighlighter = fixture.debugElement.query(By.css('.code-highlighter'));
    expect(codeHighlighter.nativeElement.textContent).toBeFalsy();
    expect(component.currentLinesSelection).toBeFalsy();
  });

  it("selecting a new configuration should remove displayed comments", () => {
    buildMockAnimation();
    loadMockFunction("0");    
    buildMockAnimation();
    const commentBox = fixture.debugElement.query(By.css('.comment-box'));
    expect(commentBox.nativeElement.textContent.trim()).toBeFalsy(); 
    expect(component.currentComment).toBeFalsy();
  });

  it("clearAnimation should reset start variable", () => {
    buildMockAnimation();
    loadMockFunction("0"); 

    buildMockAnimation();
    const codeHighlighter = fixture.debugElement.query(By.css('.code-highlighter'));
    expect(codeHighlighter.nativeElement.textContent).toBeFalsy;
    const commentBox = fixture.debugElement.query(By.css('.comment-box'));
    expect(commentBox.nativeElement.textContent).toBeFalsy; 
  });
});
