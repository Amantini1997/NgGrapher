import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AnimationConfig } from '../interfaces/codeInterfaces';
import { DynamicFunction, InputType } from '../interfaces/dynamicFunctions';
import { DataStructure, NodeType } from '../interfaces/grapherInterfaces';

import { CodeOutputComponent } from './code-output.component';

describe('CodeOutputComponent', () => {
  let component: CodeOutputComponent;
  let fixture: ComponentFixture<CodeOutputComponent>;
  
  // @ts-ignore
  let mockGeneratorFunction: GeneratorFunction = function * emptyGenerator() { 
    let generator: Generator;
    yield generator;
  };

  let mockDynamicFunction: DynamicFunction = {
    name: "alert",
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
      
      function * emptyGenerator() {}
      `,
      codeComments: [{
        code: "",
        comment: ""
      }],
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
    component.config = mockConfig;
    component.generateUserFunctionsFromCode();
    expect(component.userFunctions[0].name).toBe(mockDynamicFunction.name);
    expect(component.userFunctions[0].params).toBe(mockDynamicFunction.params);
    expect(component.userFunctions[0].lines).toBe(mockDynamicFunction.lines);
    expect(component.userFunctions[0].body).toBe(mockDynamicFunction.body);
  });

  it("clearAnimation should reset variable after animation", () => {
    component.config = mockConfig;
    component.buildInitialGraph();
    component.startAnimation();
    component.togglePause();
    component.clearAnimation();
  });

  it("clearAnimation should reset variables after", () => {

  });
});
