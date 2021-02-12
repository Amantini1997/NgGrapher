import { Input, Component, HostListener, ChangeDetectorRef } from '@angular/core';
import { DataStructure, Grapher, NodeType, Sorter, Node } from '../grapher';

@Component({
  selector: 'animator',
  templateUrl: './animator.component.html',
  styleUrls: ['./animator.component.scss']
})
export class AnimatorComponent {

  grapher: Grapher;
  nodes: Node[];
  dataStructure: DataStructure;
  nodeType: NodeType;
  originalNodesConfiguration: string;

  scale: number = 1;
  dragging: boolean;
  startingX: number;
  startingY: number;
  deltaX: number = 0;
  deltaY: number = 0;
  newDeltaX: number = 0;
  newDeltaY: number = 0;

  nodeContainer: HTMLElement;
  nodeCount: number;
  initialLeftMargin: number = 0;
  initialBottomMargin: number = 40;
  nodeSize: number = 30;
  fixedValues: string;

  // used for barPlots UI
  maxValue: number;
  minValue: number;
  minBarHeight: number = 5;
  maxBarHeight: number = 200;
  barsPadding: number = 5;

  @Input() 
  set newGrapher( grapher: Grapher) {
    if(!grapher) return;
    this.grapher = grapher;
    this.nodes = grapher.getNodes();
    this.dataStructure = grapher.getDataStructure();
    this.nodeType = grapher.getNodeType();
    this.grapher.setSwapFunction(this.swap);
    this.nodeCount = this.nodes.length;
    switch(this.dataStructure) {
      case DataStructure.BarPlot:
        this.normaliseBarsHeight();
      break;
      case DataStructure.List:

      break;
      case DataStructure.Tree:

      break;
    }
    this.cdRef.detectChanges();
    this.adjustBarPlotPaddings();
    this.originalNodesConfiguration = document.querySelector(".fixed-ctn").innerHTML;
  }
  
  constructor(private cdRef: ChangeDetectorRef) { }

  normaliseBarsHeight() {
    const values = this.nodes.map(node => node.value);
    const minValue = Math.min(...values);
    this.minValue = (minValue > 0) ? 0 : minValue;
    this.maxValue = Math.abs(Math.max(...values));
  }

  adjustBarPlotPaddings() {
    if (!this.nodeContainer) {
      this.nodeContainer = document.querySelector(".node-ctn");
    }
    const graphWidth = this.nodeSize * this.nodeCount + this.barsPadding * (this.nodeCount - 1);
    const containerWidth = Number(getComputedStyle(this.nodeContainer).getPropertyValue("width").slice(0, -2));
    this.initialLeftMargin = (containerWidth - graphWidth) / 2;
  }

  normalisedNodeValue(value: number): number {
    return (value - this.minValue) / (this.maxValue - this.minValue);
  }

  restoreOriginalConfiguration() {
    // document.querySelector(".fixed-ctn").innerHTML = this.originalNodesConfiguration;
  }

  swap = (index1: number, index2: number) => {
    const node1 = document.querySelector(`.node[data-index="${index1}"]`) as HTMLElement;
    const node2 = document.querySelector(`.node[data-index="${index2}"]`) as HTMLElement;
    node1.dataset.index = String(index2);
    node2.dataset.index = String(index1);
    // this.swapProperty(node1, node2, "top");
    this.swapProperty(node1, node2, "left");
  }

  swapProperty(element1: HTMLElement, element2: HTMLElement, property: string) {
    const propertyElement1 = getComputedStyle(element1).getPropertyValue(property);
    const propertyElement2 = getComputedStyle(element2).getPropertyValue(property);
    element1.style.setProperty(property, propertyElement2);
    element2.style.setProperty(property, propertyElement1);
  }

  showVal(event: WheelEvent) {
    event.preventDefault();
    const origin = this.getOrigin(event);
    if (!origin) {
      console.log("TOO MUCH OFFSET");
      return;
    }
    const updated = this.updateScale(event);
    if (!updated) {
      console.log("CANNOT SCALE ANYMORE");
    }
  }

  getZoomDirection({deltaY}): 1|-1 {
    return deltaY < 0 ? 1 : -1;
  }

  updateScale({deltaY}): boolean {
    const changingFactor = this.getZoomDirection({deltaY}) * 0.1;
    if (this.scale + changingFactor < 0.01) return false; 
    this.scale += changingFactor;
    return true;
  }

  getOrigin(event: WheelEvent): [number, number] {
    // it breaks at some point
    const bounds = this.nodeContainer.getBoundingClientRect();
    let x = (event.clientX - bounds.left) * .5;
    let y = (event.clientY - bounds.top) * .25;
    if (isNaN(x) || isNaN(y)) return null;
    return [x, y];
  }

  updatePropertyInPx(element: HTMLElement, property: string, delta: number) {
    element.style.setProperty(property, delta + "px");
  }

  shiftGraph(event: MouseEvent) {
    event.preventDefault();
    if (this.dragging) {
      this.newDeltaX = event.x - this.startingX;
      this.newDeltaY = event.y - this.startingY;
      this.updatePropertyInPx(this.nodeContainer, "margin-left", this.newDeltaX + this.deltaX);
      this.updatePropertyInPx(this.nodeContainer, "margin-top", this.newDeltaY + this.deltaY);
    }
  }

  setDragging(isDragging: boolean, event: MouseEvent = null) {
    this.dragging = isDragging;
    if (isDragging) {
      this.startingX = event.x;
      this.startingY = event.y;
    } else {
      this.deltaX += this.newDeltaX; 
      this.deltaY += this.newDeltaY; 
    }
  }
}
