import { AnimatorComponent } from '../animator/animator.component';

import { Grapher, NodeType, DataStructure } from './grapher';

describe('Grapher class', () => {
  let grapher: Grapher;
  const animator: AnimatorComponent = new AnimatorComponent(null);
  animator.shiftNodeToLeft = () => {};
  animator.shiftNodeToRight = () => {};
  animator.refreshGraph = () => {};
  const initialValues = [1,2,3];
  const DATA_STRUCTURE = DataStructure.List;
  const NODE_TYPE = NodeType.Square;

  beforeEach(() => {
    grapher = new Grapher(
      NODE_TYPE,
      DATA_STRUCTURE,
      initialValues
    );
    grapher._setAnimator(animator);
  });

  it('should create a full instance', () => {
    expect(grapher).toBeTruthy();
    expect(grapher.getNodes()).toHaveSize(3);
  });

  it('push should add a value at the end', () => {
    const newElement = 4;
    const initialLength = grapher.getNodes().length;
    grapher.push(newElement);
    expect(grapher.getNodes()[initialLength].value).toEqual(newElement);
    expect(grapher.getNodes()).toHaveSize(initialLength + 1);
  });

  it('pop should remove and return lst element', () => {
    const lastIndex = grapher.getNodes().length - 1;
    const lastElement = grapher.getNodes()[lastIndex];
    const poppedElement = grapher.pop();
    expect(poppedElement).toEqual(lastElement.value);
    expect(grapher.getNodes()).toHaveSize(lastIndex);
  });

  it('unshift should add a value at the beginning', () => {
    const newElement = 4;
    const initialLength = grapher.getNodes().length;
    grapher.unshift(newElement);
    expect(grapher.getNodes()[0].value).toEqual(newElement);
    expect(grapher.getNodes()).toHaveSize(initialLength + 1);
  });

  it('shift should remove and return first element', () => {
    const originalLength = grapher.getNodes().length;
    const firstElement = grapher.getNodes()[0];
    const shiftedElement = grapher.shift();
    expect(shiftedElement).toEqual(firstElement.value);
    expect(grapher.getNodes()).toHaveSize(originalLength - 1);
  });

  it('swap should swap two values', () => {
    const initialLength = grapher.getNodes().length;
    const originalNodes = [...grapher.getNodes()];
    grapher.swap(0, 2);
    expect(grapher.getNodes()[0]).toEqual(originalNodes[2]);
    expect(grapher.getNodes()[2]).toEqual(originalNodes[0]);
    expect(grapher.getNodes()).toHaveSize(initialLength);
  });

  it('appendValues should add values at the end', () => {
    const newElements = [4, 5, 6];
    const initialLength = grapher.getNodes().length;
    grapher.appendValues([...newElements]);
    expect(grapher.getNodes()[initialLength].value).toEqual(newElements[0]);
    expect(grapher.getNodes()).toHaveSize(initialLength + newElements.length);
  });

  it('insertAt should insert a value at a given index', () => {
    const newElement = 4;
    const position = 0;
    const initialLength = grapher.getNodes().length;
    const previousElementAtPosition = grapher.getNodes()[position].value;
    grapher.insertAt(position, newElement);
    expect(grapher.getNodes()[position].value).toEqual(newElement);
    expect(grapher.getNodes()[position + 1].value).toEqual(previousElementAtPosition);
    expect(grapher.getNodes()).toHaveSize(initialLength + 1);
  });

  it('removeAt should remove a value at a given index and return the previous value', () => {
    const position = 0;
    const initialLength = grapher.getNodes().length;
    const elementToRemove = grapher.getNodes()[position].value;
    const removedElement = grapher.removeAt(position);
    expect(grapher.getNodes()[position].value).not.toEqual(elementToRemove);
    expect(removedElement).toEqual(elementToRemove);
    expect(grapher.getNodes()).toHaveSize(initialLength - 1);
  });

  it('replaceAt should replace a value at a given index and return the previous value', () => {
    const position = 0;
    const initialLength = grapher.getNodes().length;
    const elementToRemove = grapher.getNodes()[position].value;
    const newElement = 4;
    const removedElement = grapher.replaceAt(position, newElement);
    expect(grapher.getNodes()[position].value).not.toEqual(elementToRemove);
    expect(grapher.getNodes()[position].value).toEqual(newElement);
    expect(removedElement).toEqual(elementToRemove);
    expect(grapher.getNodes()).toHaveSize(initialLength);
  });

  it('setNodeMode should the colour of a node', () => {
    const index = 0;
    const nodeToExamine = grapher.getNodes()[index];
    expect(nodeToExamine.HEXColor).toEqual(grapher["DEFAULT_HEX_COLOR"]);
    grapher.setNodeModeCompared(index);
    expect(nodeToExamine.HEXColor).toEqual(grapher["COMPARED_HEX_COLOR"]);
  });

  it('setNodeModeCustom should the colour of a node', () => {
    const index = 0;
    const nodeToExamine = grapher.getNodes()[index];
    expect(nodeToExamine.HEXColor).toEqual(grapher["DEFAULT_HEX_COLOR"]);
    grapher.setNodeModeCustom(index, "fff");
    expect(nodeToExamine.HEXColor).toEqual("#fff");
  });
});
