import { Input, Component, ChangeDetectorRef } from '@angular/core';
import { DataStructure, Grapher, NodeType, Node } from '../grapher';

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

  duration: string;
  delay: string;
  readonly MILLISECONDS_TO_SECONDS: number = 0.001;
  readonly SPEED_DURATION_RATIO: number = 3/5 * this.MILLISECONDS_TO_SECONDS;
  readonly SPEED_DELAY_RATIO: number = 1/5 * this.MILLISECONDS_TO_SECONDS;

  scale: number = 1;
  dragging: boolean;
  startingX: number;
  startingY: number;
  deltaX: number = 0;
  deltaY: number = 0;
  newDeltaX: number = 0;
  newDeltaY: number = 0;

  graphLeftMargin: number = 0;
  graphBottomMargin: number = 40;
  nodeContainer: HTMLElement;
  nodeTypePadding: number;
  graphHeight: number;
  fixedValues: string;
  readonly NODE_WIDTH: number = 30;

  // used for barPlots UI
  readonly MIN_BAR_HEIGHT: number = 5;
  readonly MAX_BAR_HEIGHT: number = 200;
  readonly BAR_PADDING: number = 5;

  // used for list UI
  readonly SQUARE_PADDING: number = 30;
  readonly SQUARE_HEIGHT: number = this.NODE_WIDTH;

  @Input() 
  set newSpeed(speed: number) {
    this.duration = speed * this.SPEED_DURATION_RATIO + "s";
    this.delay = speed * this.SPEED_DELAY_RATIO + "s";
  }

  @Input() 
  set newGrapher(grapher: Grapher) {
    if(!grapher) return;
    this.grapher = grapher;
    this.grapher._setAnimator(this);
    this.nodes = this.grapher.getNodes();
    this.dataStructure = grapher.getDataStructure();
    this.nodeType = grapher.getNodesType();

    this.cdRef.detectChanges();
    this.buildGraph();
  }

  buildGraph() {
    if (!this.nodeContainer) {
      this.nodeContainer = document.querySelector(".node-ctn");
    }

    switch(this.dataStructure) {
      case DataStructure.BarPlot:
        this.nodeTypePadding = this.BAR_PADDING;
        this.adjustBarsHeight();
      break;

      case DataStructure.List:
        this.nodeTypePadding = this.SQUARE_PADDING;
        this.graphHeight = this.SQUARE_HEIGHT;
      break;

      case DataStructure.Tree:
        //TODO implement
      break;
    }
    this.centerNodes();
  }
  
  constructor(private cdRef: ChangeDetectorRef) { }

  adjustBarsHeight() {
    this.normaliseBarsHeight();
    this.graphHeight = Math.max(...this.nodes.map(node => node.height));
  }

  refreshGraph = (nodeWasAdded: boolean) => {
    this.nodes = this.grapher.getNodes();
    if (this.dataStructure == DataStructure.BarPlot) {
      this.adjustBarsHeight();
    }
    if (nodeWasAdded) {
      this.centerNodes();
    }
    this.cdRef.detectChanges();
  }

  normaliseBarsHeight() {
    const values = this.nodes.map(node => node.value);
    let minValue = Math.min(...values);
    minValue = (minValue > 0) ? 0 : minValue;
    const maxValue = Math.abs(Math.max(...values));
    const deltaMinMax = maxValue - minValue;

    this.nodes.forEach(node => {
      node.height = (node.value - minValue) / deltaMinMax * this.MAX_BAR_HEIGHT + this.MIN_BAR_HEIGHT;
    });
  }

  centerNodes() {
    // set the left margin
    const nodesLength = this.nodes.length;
    const graphWidth = this.NODE_WIDTH * nodesLength + this.nodeTypePadding * (nodesLength - 1);
    const containerWidth = Number(getComputedStyle(this.nodeContainer).getPropertyValue("width").slice(0, -2));
    this.graphLeftMargin = (containerWidth - graphWidth) / 2;
    this.nodes.forEach((node, nodeIndex) => 
      node.left = nodeIndex * (this.NODE_WIDTH + this.nodeTypePadding) + this.graphLeftMargin
    );

    // set the bottom margin
    const containerHeight = Number(getComputedStyle(this.nodeContainer).getPropertyValue("height").slice(0, -2));
    this.graphBottomMargin = (containerHeight - this.graphHeight) / 2
  }

  //// swapProperty(element1: HTMLElement, element2: HTMLElement, property: string) {
  ////   const propertyElement1 = getComputedStyle(element1).getPropertyValue(property);
  ////   const propertyElement2 = getComputedStyle(element2).getPropertyValue(property);
  ////   element1.style.setProperty(property, propertyElement2);
  ////   element2.style.setProperty(property, propertyElement1);
  //// }

  // if multiplier is set to 0.5, the elements only make 
  // half a shift, and this can be used to insert a node
  // between two other nodes.
  shiftNodeToRight(node: Node) {
    const HALF_BLOCK = 0.5;
    node.left += (this.NODE_WIDTH + this.nodeTypePadding) * HALF_BLOCK;
  }

  // if multiplier is set to 0.5, the elements only make 
  // half a shift, and this can be used to insert a node
  // between two other nodes.
  shiftNodeToLeft(node: Node) {
    const HALF_BLOCK = 0.5;
    node.left -= (this.NODE_WIDTH + this.nodeTypePadding) * HALF_BLOCK;
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

  getNonEmptyNodes(): Node[] {
    return this.grapher.getNodes().filter(node => node);
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
