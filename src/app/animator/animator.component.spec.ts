import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Grapher } from '../grapher/grapher';
import { DataStructure, NodeType } from '../interfaces/grapherInterfaces';

import { AnimatorComponent } from './animator.component';

describe('AnimatorComponent', () => {
  let component: AnimatorComponent;
  let fixture: ComponentFixture<AnimatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ 
        AnimatorComponent
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AnimatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  
 it('buildGraph should call adjustBarsHeightToScreen if bar plot structure is used', () => {
    component.dataStructure = DataStructure.BarPlot;
    component.centerNodes = () => {};
    spyOn(component, "adjustBarsHeightToScreen");
    component.buildGraph();
    expect(component.adjustBarsHeightToScreen).toHaveBeenCalled();
  });
    
  it('buildGraph should center nodes', () => {
    spyOn(component, "centerNodes");
    component.buildGraph();
    expect(component.centerNodes).toHaveBeenCalledOnceWith();
  });

  it('normaliseBarsHeight should normalise bar heights', () => {
    createNodes(component, [0,1,2]);
    component.normaliseBarsHeight();
    expect(component.nodes[2].height).toBe(205);
    expect(component.nodes[1].height).toBe(105);
    expect(component.nodes[0].height).toBe(5);
  });

  it('normaliseBarsHeight should normalise negative bar heights', () => {
    createNodes(component, [-3,1,2]);
    component.normaliseBarsHeight();
    expect(component.nodes[2].height).toBe(205);
    expect(component.nodes[1].height).toBe(165);
    expect(component.nodes[0].height).toBe(5);
  });
    
  it('adjustBarsHeightToScreen should adjust the bars height', () => {
    createNodes(component, [-3,1,2]);
    component.adjustBarsHeightToScreen();
    expect(component.graphHeight).toBe(205)
  });

});

function createNodes(component: AnimatorComponent, initialValues: any[]) {
  let grapher = new Grapher(NodeType.Square, DataStructure.List, initialValues);
  component.newGrapher = grapher;
}  