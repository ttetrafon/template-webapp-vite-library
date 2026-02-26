import { eventNames } from "../data/enums.ts";

///////////////////////////
///   BUILDING BLOCKS   ///
///////////////////////////

interface NodeStructure {
  id?: string;
  element: string;
  contents?: string | NodeStructure[];
  newLine?: boolean;
  attributes?: Array<{ attribute: string; value: string | object }>;
  order?: string[];
}

export async function buildStructureFromHtml(element: HTMLElement): Promise<Record<string, NodeStructure>> {
  // console.log("---> buildStructureFromHtml()", element);
  let data: Record<string, NodeStructure> = {};

  let nodesNumber = element.childNodes.length;
  if (nodesNumber == 0) return data;

  if (nodesNumber == 1) {
    let id = element.id.split("::")[1];
    data[id] = await elementStructure(element, element.childNodes[0]);
    return data;
  }

  for (let i = 0; i < nodesNumber; i++) {
    console.log(element.childNodes[i]);
  }

  return data;
}
async function elementStructure(element: HTMLElement, node: ChildNode): Promise<NodeStructure> {
  let structure: NodeStructure = { element: element.nodeName.toLowerCase() };
  switch (node.nodeName) {
    case '#text':
      // console.log("... single #text node");
      structure.id = element.id.split("::")[1];
      structure.element = element.nodeName.toLowerCase();
      structure.contents = (element as HTMLElement).innerText;
      let newLine = element.getAttribute("new-line");
      if (newLine) {
        structure.newLine = true;
      }
      break;
  }
  return structure;
}

export async function buildHtmlFromStructure(data: NodeStructure, parent: Node): Promise<void> {
  // console.log(`---> buildHtmlFromStructure`, data, parent);
  clearChildren(parent as HTMLElement);
  for (let i = 0; i < data.order!.length; i++) {
    let element = (data as any)[data.order![i]];
    let node = await buildElement(element);
    parent.appendChild(node);
  }
}
export async function buildElement(node: NodeStructure): Promise<Node> {
  // Create text nodes
  if (node.element === "#text") {
    return document.createTextNode(node.contents as string);
  }

  // Create the main element
  const el = document.createElement(node.element);

  // Add attributes
  if (node.id) {
    el.id = `id::${ node.id }`;
  }
  if (node.attributes) {
    node.attributes.forEach(attr => el.setAttribute(attr.attribute, (typeof attr.value == "object" ? JSON.stringify(attr.value) : attr.value)));
  }

  // Handle contents (recursively if necessary)
  if (Array.isArray(node.contents)) {
    node.contents.forEach(childNode => el.appendChild(buildElement(childNode as NodeStructure) as any));
  }
  else if (node.contents && typeof node.contents === "string") {
    el.textContent = node.contents;
  }

  return el;
}

//////////////////////////
///   CHILD ELEMENTS   ///
//////////////////////////

export async function clearChildren(parent: HTMLElement): Promise<void> {
  while (parent.firstChild) {
    parent.removeChild(parent.lastChild!);
  }
}
export async function clearChildrenOfType(parent: HTMLElement, tag: string): Promise<void> {
  for (let i = parent.children.length - 1; i >= 0; i--) {
    if ((parent.children[i].nodeName).toLowerCase() === tag) parent.children[i].remove();
  }
}
export async function clearChildrenOfClass(parent: HTMLElement, className: string): Promise<void> {
  for (let i = parent.children.length - 1; i >= 0; i--) {
    if (parent.children[i].classList.contains(className)) parent.children[i].remove();
  }
}

export async function findSelfIndexInParent(self: Element): Promise<number> {
  let element: Element | null = self;
  let index = 0;
  while (element.previousElementSibling) {
    element = element.previousElementSibling;
    index++;
  }
  return index;
}

export async function putElementBefore(newElement: Node, anchorElement: Node): Promise<void> {
  anchorElement.parentNode!.insertBefore(newElement, anchorElement);
}

export async function putElementAfter(newElement: Node, anchorElement: Node): Promise<void> {
  // console.log("---> putElementAfter(newElement, anchorElement)", newElement, anchorElement);
  if (anchorElement.nextSibling) {
    // console.log("anchorElement.nextSibling:", anchorElement.nextSibling);
    anchorElement.parentNode!.insertBefore(newElement, anchorElement.nextSibling);
  }
  else {
    // console.log("anchorElement.parentNode:", anchorElement.parentNode);
    anchorElement.parentNode!.appendChild(newElement);
  }
}

//////////////////////////
///   INPUT ELEMENTS   ///
//////////////////////////

export async function populateSelectorOptions(selector: HTMLSelectElement, options: Array<Record<string, string>>, valueKey: string, textKey: string): Promise<void> {
  if (!options) return;
  options.forEach(option => {
    let opt = document.createElement("option");
    opt.value = option[valueKey]
    opt.innerText = option[textKey];
    selector.appendChild(opt);
  });
}

export async function setDateInputAsToday(dateInput: HTMLInputElement): Promise<void> {
  const today = new Date();

  // Format the date as yyyy-mm-dd
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  dateInput.value = `${ year }-${ month }-${ day }`;
}

interface DetailControls {
  detailsForcedOpen: boolean;
  detailsOpenFromHover: boolean;
}

export async function makeDetailsPanelOpenHoverable(context: unknown, details: HTMLDetailsElement, summary: HTMLElement, detailControls: DetailControls): Promise<void> {
  details.addEventListener("mouseenter", toggleDetailsVisibility.bind(context as object, details, detailControls, true));
  details.addEventListener("mouseleave", toggleDetailsVisibility.bind(context as object, details, detailControls, false));
  summary.addEventListener("click", summaryClicked.bind(context as object, details, detailControls));
}

export async function unmakeDetailsPanelOpenHoverable(details: HTMLDetailsElement, summary: HTMLElement): Promise<void> {
  details.removeEventListener("mouseenter", toggleDetailsVisibility as EventListener);
  details.removeEventListener("mouseleave", toggleDetailsVisibility as EventListener);
  summary.removeEventListener("click", summaryClicked as EventListener);
}

function summaryClicked(this: unknown, details: HTMLDetailsElement, detailControls: DetailControls, event: Event): void {
  event.preventDefault();
  event.stopImmediatePropagation();

  if (detailControls.detailsOpenFromHover) {
    detailControls.detailsForcedOpen = true;
    detailControls.detailsOpenFromHover = false;
  }
  else {
    if (details.open) {
      details.removeAttribute("open");
      detailControls.detailsForcedOpen = false;
    }
    else {
      details.setAttribute("open", "");
      detailControls.detailsForcedOpen = true;
    }
  }
}

function toggleDetailsVisibility(this: unknown, details: HTMLDetailsElement, detailControls: DetailControls, mouseHover: boolean, event: Event): void {
  event.stopImmediatePropagation();
  if (detailControls.detailsForcedOpen) return;

  if (mouseHover) {
    detailControls.detailsOpenFromHover = true;
    details.setAttribute("open", "");
  }
  else {
    detailControls.detailsOpenFromHover = false;
    details.removeAttribute("open")
  }
}

export function getCaretPosition(element: HTMLElement): number {
  let caretPos = 0;
  let sel: Selection | null, range: Range;

  if (window.getSelection) {
    sel = window.getSelection();
    if (sel && sel.rangeCount) {
      range = sel.getRangeAt(0);

      if (range.commonAncestorContainer.parentNode == element ||
        range.commonAncestorContainer == element) {

        // Create a clone of the range
        const preCaretRange = range.cloneRange();
        // Select all contents of the contenteditable
        preCaretRange.selectNodeContents(element);
        // Set end to the original range's end
        preCaretRange.setEnd(range.endContainer, range.endOffset);
        // Get the length (in characters) of the text from start to caret
        caretPos = preCaretRange.toString().length;
      }
    }
  }

  return caretPos;
}

export function getTotalCharacterCount(element: HTMLElement): number {
  // TODO: will need to recursively run the node-tree for custom elements...
  const text = element.textContent || element.innerText;
  return text.length;
}

export function setCaretPosition(selection: Selection, element: HTMLElement, position: number): void {
  if (element) {
    const range = document.createRange();
    const textNode = element.firstChild;
    if (textNode) {
      range.setStart(textNode, Math.min(position, (textNode as Text).length));
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    }
    else {
      range.setStart(element, 0);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }
}

export function setCaretPositionAtEnd(element: HTMLElement): void {
  const selection = window.getSelection();
  if (!selection) return;
  const range = document.createRange();
  if (!range) return;
  range.selectNodeContents(element);
  range.collapse(false);
  selection.removeAllRanges();
  selection.addRange(range);
}

//////////////////
///   EVENTS   ///
//////////////////

export async function emitCustomEvent(that: EventTarget, eventName: string, eventDetails: object): Promise<void> {
  that.dispatchEvent(new CustomEvent(eventName, {
    bubbles: true,
    composed: true,
    detail: eventDetails
  }));
};

export async function toggleSpinningCircle(that: EventTarget, state: boolean): Promise<void> {
  console.log("...");
  emitCustomEvent(that, eventNames.TOGGLE_SPINNING_CIRCLE.description!, {
    bubbles: true,
    composed: true,
    state: state
  });
}

export async function emitNavigationEvent(that: EventTarget, targetUrl: string, stateData?: unknown): Promise<void> {
  emitCustomEvent(that, eventNames.NAVIGATE.description!, {
    bubbles: true,
    composed: true,
    target: targetUrl,
    stateData: stateData
  });
}

export async function emitDialogEvent(that: EventTarget, webComponent: string, data: object, confirmCb?: Function, cancelCb?: Function): Promise<void> {
  emitCustomEvent(that, eventNames.DIALOG_OPEN.description!, {
    bubbles: true,
    composed: true,
    element: webComponent,
    data: data,
    confirmCb: confirmCb,
    cancelCb: cancelCb
  });
}
export async function emitDialogConfirmEvent(that: EventTarget, data: unknown): Promise<void> {
  emitCustomEvent(that, eventNames.DIALOG_CONFIRM.description!, {
    bubbles: true,
    composed: true,
    data: data
  });
}
export async function emitDialogCancelEvent(that: EventTarget): Promise<void> {
  emitCustomEvent(that, eventNames.DIALOG_CANCEL.description!, {
    bubbles: true,
    composed: true
  });
}

export async function emitSubPageContainerEvent(that: EventTarget, route: string): Promise<void> {
  setTimeout(() => {
    emitCustomEvent(that, eventNames.SUB_PAGE_CONTAINER.description!, {
      bubbles: true,
      composed: true,
      container: that,
      route: route
    });
  }, 0);
}

///////////////
///   CSS   ///
///////////////

export function getNumberFromPixelValue(element: HTMLElement, cssProperty: string): number {
  const style = getComputedStyle(element);
  const size = style.getPropertyValue(cssProperty);
  let len = size.length;
  let num = size.substring(0, len);
  return parseFloat(num);
}
