import { Input, Component, ChangeDetectorRef } from '@angular/core';
import { DataStructure, Grapher, NodeType, AnimationNode } from '../grapher/grapher';

@Component({
  selector: 'animator',
  templateUrl: './animator.component.html',
  styleUrls: ['./animator.component.scss']
})
export class AnimatorComponent {

  // grapher variables
  grapher: Grapher;
  nodes: AnimationNode[];
  dataStructure: DataStructure;
  nodeType: NodeType;

  // slider variables
  duration: string;
  delay: string;
  readonly MILLISECONDS_TO_SECONDS: number = 0.001;
  readonly SPEED_DURATION_RATIO: number = 3/5 * this.MILLISECONDS_TO_SECONDS;
  readonly SPEED_DELAY_RATIO: number = 1/5 * this.MILLISECONDS_TO_SECONDS;

  // animator variables
  scale: number = 1;
  dragging: boolean;
  startingX: number;
  startingY: number;
  deltaX: number = 0;
  deltaY: number = 0;
  newDeltaX: number = 0;
  newDeltaY: number = 0;
  readonly MIN_SCALE: number = 0.01; 

  // animator grapher-dependant variables
  graphLeftMargin: number = 0;
  graphBottomMargin: number = 40;
  nodeContainer: HTMLElement;
  nodeTypePadding: number;
  graphHeight: number;
  fixedValues: string;
  readonly NODE_WIDTH: number = 30;

  // barPlots UI variables
  readonly MIN_BAR_HEIGHT: number = 5;
  readonly MAX_BAR_HEIGHT: number = 200;
  readonly BAR_PADDING: number = 5;

  // list UI variables
  readonly SQUARE_PADDING: number = 30;
  readonly SQUARE_HEIGHT: number = this.NODE_WIDTH;

  @Input() title: string;

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
  
  constructor(private cdRef: ChangeDetectorRef) { }

  buildGraph() {
    this.setNodeContainerIfUndefined();

    // Configure the nodes of the animation depending 
    // on the data structure 
    switch(this.dataStructure) {
      case DataStructure.BarPlot:
        this.nodeTypePadding = this.BAR_PADDING;
        this.adjustBarsHeightToScreen();
        break;

      case DataStructure.List:
        this.nodeTypePadding = this.SQUARE_PADDING;
        this.graphHeight = this.SQUARE_HEIGHT;
        break;
    }
    this.centerNodes();
  }

  setNodeContainerIfUndefined() {
    if (!this.nodeContainer) {
      this.nodeContainer = document.querySelector(".node-ctn");
    }
  }

  adjustBarsHeightToScreen() {
    // This method is called only when the data structure used
    // is of type barplot.
    // It adjusts the heights of all the bars to have them 
    // nicely fit in the screen
    this.normaliseBarsHeight();
    const nodesHeight = this.nodes.map(node => node.height);
    this.graphHeight = Math.max(...nodesHeight);
  }

  refreshGraph = (nodeWasAdded: boolean) => {
    if (this.dataStructure === DataStructure.BarPlot) {
      this.adjustBarsHeightToScreen();
    }
    if (nodeWasAdded) {
      this.centerNodes();
    }
    this.cdRef.detectChanges();
  }

  normaliseBarsHeight() {
    // used to set the height of barplot bars with respect
    // to their values
    const values = this.nodes.map(node => node.value) as number[];
    let minValue = Math.min(...values);
    minValue = (minValue > 0) ? 0 : minValue;
    const maxValue = Math.abs(Math.max(...values));
    const deltaMinMax = maxValue - minValue;

    this.nodes.forEach(node => 
      node.height = (node.value as number - minValue) / deltaMinMax * this.MAX_BAR_HEIGHT + this.MIN_BAR_HEIGHT
    );
  }

  centerNodes() {
    this.setNodesLeftMargin();
    this.setNodesBottomMargin();
  }

  setNodesLeftMargin() {
    const nodesLength = this.nodes.length;
    const graphWidth = this.NODE_WIDTH * nodesLength + this.nodeTypePadding * (nodesLength - 1);
    const containerWidth = Number(getComputedStyle(this.nodeContainer).getPropertyValue("width").slice(0, -2));
    this.graphLeftMargin = (containerWidth - graphWidth) / 2;
    this.nodes.forEach((node, nodeIndex) => 
      node.left = nodeIndex * (this.NODE_WIDTH + this.nodeTypePadding) + this.graphLeftMargin
    );
  }

  setNodesBottomMargin() {
    const containerHeight = Number(getComputedStyle(this.nodeContainer).getPropertyValue("height").slice(0, -2));
    this.graphBottomMargin = (containerHeight - this.graphHeight) / 2;
  }

  shiftNodeToRight(node: AnimationNode) {
    this.shiftNode(node, +1);
  }

  shiftNodeToLeft(node: AnimationNode) {
    this.shiftNode(node, -1);
  }

  shiftNode(node: AnimationNode, shiftDirection: 1 | -1) {
    const HALF_BLOCK = 0.5;
    const shiftAmount = (this.NODE_WIDTH + this.nodeTypePadding) * HALF_BLOCK * shiftDirection;
    node.left += shiftAmount;
  }

  applyWheelZoom(event: WheelEvent) {
    if (!this.nodeContainer) return;
    event.preventDefault();
    this.updateScale(event);
  }

  getZoomDirection({deltaY}: any): 1 | -1 {
    return deltaY < 0 ? 1 : -1;
  }

  updateScale({deltaY}: any): boolean {
    const changingFactor = this.getZoomDirection({deltaY}) * 0.1;
    const scaleIsMinScale = this.scale + changingFactor < this.MIN_SCALE;
    if (!scaleIsMinScale) {
      this.scale += changingFactor;
    } 
    return !scaleIsMinScale;
  }

  updatePropertyInPx(element: HTMLElement, property: string, delta: number) {
    element.style.setProperty(property, delta + "px");
  }

  shiftGraph(event: MouseEvent) {
    if (!this.grapher) return;
    
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
