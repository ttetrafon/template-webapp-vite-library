import { eventNames } from "../../data/enums.js";

///////////////////////////
///   BUILDING BLOCKS   ///
///////////////////////////

/**
 *
 * @param {element} innerHTML
 */
export async function buildStructureFromHtml(element) {
  // console.log("---> buildStructureFromHtml()", element);
  // https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML
  let data = {};

  let nodesNumber = element.childNodes.length;
  if (nodesNumber == 0) return data;

  // If there is only a single child node, we either have a single element within - could be either #text or any custom element
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
async function elementStructure(element, node) {
  let structure = {};
  switch (node.nodeName) {
    case '#text':
      // console.log("... single #text node");
      structure.id = element.id.split("::")[1];
      structure.element = element.nodeName.toLowerCase();
      structure.contents = element.innerText;
      let newLine = element.getAttribute("new-line");
      if (newLine) {
        structure.newLine = true;
      }
      break;
  }
  return structure;
}

/**
 *
 * @param {json} data
 * @param {Node} parent
 */
export async function buildHtmlFromStructure(data, parent) {
  // console.log(`---> buildHtmlFromStructure`, data, parent);
  clearChildren(parent);
  for (let i = 0; i < data.order.length; i++) {
    let element = data[data.order[i]];
    let node = await buildElement(element);
    parent.appendChild(node);
  }
}
export async function buildElement(node) {
  // Create text nodes
  if (node.element === "#text") {
    return document.createTextNode(node.contents);
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
    node.contents.forEach(childNode => el.appendChild(buildElement(childNode)));
  }
  else if (node.contents && typeof node.contents === "string") {
    el.textContent = node.contents;
  }

  return el;
}

//////////////////////////
///   CHILD ELEMENTS   ///
//////////////////////////

export async function clearChildren(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.lastChild);
  }
}
export async function clearChildrenOfType(parent, tag) {
  for (let i = parent.children.length - 1; i >= 0; i--) {
    if ((parent.children[i].nodeName).toLowerCase() === tag) parent.children[i].remove();
  }
}
export async function clearChildrenOfClass(parent, className) {
  for (let i = parent.children.length - 1; i >= 0; i--) {
    if (parent.children[i].classList.contains(className)) parent.children[i].remove();
  }
}

/**
 *
 * @param {HTMLElement} self
 * @param {HTMLElement} parent
 */
export async function findSelfIndexInParent(self) {
  let element = self;
  let index = 0;
  while (element.previousElementSibling) {
    element = element.previousElementSibling;
    index++;
  }
  return index;
}

/**
 *
 * @param {HTMLElement} newElement
 * @param {HTMLElement} anchorElement
 */
export async function putElementBefore(newElement, anchorElement) {
  anchorElement.parentNode.insertBefore(newElement, anchorElement);
}
/**
 *
 * @param {HTMLElement} newElement
 * @param {HTMLElement} anchorElement
 */
export async function putElementAfter(newElement, anchorElement) {
  // console.log("---> putElementAfter(newElement, anchorElement)", newElement, anchorElement);
  if (anchorElement.nextSibling) {
    // console.log("anchorElement.nextSibling:", anchorElement.nextSibling);
    anchorElement.parentNode.insertBefore(newElement, anchorElement.nextSibling);
  }
  else {
    // console.log("anchorElement.parentNode:", anchorElement.parentNode);
    anchorElement.parentNode.appendChild(newElement);
  }
}

//////////////////////////
///   INPUT ELEMENTS   ///
//////////////////////////

/**
 * Creates options within a select element.
 * @param {HTMLElement} selector
 * @param {Array<Object>} options
 * @param {string} valueKey
 * @param {string} textKey
 */
export async function populateSelectorOptions(selector, options, valueKey, textKey) {
  if (!options) return;
  options.forEach(option => {
    let opt = document.createElement("option");
    opt.value = option[valueKey]
    opt.innerText = option[textKey];
    selector.appendChild(opt);
  });
}
/**
 * Sets the date in the input to today by default.
 * @param {HTMLElement} dateInput
 */
export async function setDateInputAsToday(dateInput) {
  const today = new Date();

  // Format the date as yyyy-mm-dd
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  dateInput.value = `${ year }-${ month }-${ day }`;
}

/**
 *
 * @param {HTMLElement} details
 * @param {HTMLElement} summary
 * @param {Object} detailControls
 */
export async function makeDetailsPanelOpenHoverable(context, details, summary, detailControls) {
  details.addEventListener("mouseenter", toggleDetailsVisibility.bind(context, details, detailControls, true));
  details.addEventListener("mouseleave", toggleDetailsVisibility.bind(context, details, detailControls, false));
  summary.addEventListener("click", summaryClicked.bind(context, details, detailControls));
}
/**
 *
 * @param {HTMLElement} details
 * @param {HTMLElement} summary
 */
export async function unmakeDetailsPanelOpenHoverable(details, summary) {
  details.removeEventListener("mouseenter", toggleDetailsVisibility);
  details.removeEventListener("mouseleave", toggleDetailsVisibility);
  summary.removeEventListener("click", summaryClicked);
}
/**
 *
 * @param {HTMLElement} details
 * @param {Object} detailControls
 * @param {Event} event
 */
function summaryClicked(details, detailControls, event) {
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
/**
 *
 * @param {HTMLElement} details
 * @param {Object} detailControls
 * @param {Boolean} mouseHover
 * @param {Event} event
 * @returns
 */
function toggleDetailsVisibility(details, detailControls, mouseHover, event) {
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

/**
 *
 * @param {HTMLElement} element
 * @returns Integer
 */
export function getCaretPosition(element) {
  let caretPos = 0;
  let sel, range;

  if (window.getSelection) {
    sel = window.getSelection();
    if (sel.rangeCount) {
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
/**
 * Counts the total number of characters within an element and its children.
 * @param {HTMLElement} element
 * @returns Integer
 */
export function getTotalCharacterCount(element) {
  // TODO: will need to recursively run the node-tree for custom elements...
  const text = element.textContent || element.innerText;
  return text.length;
}
/**
 *
 * @param {Selection} selection
 * @param {HTMLElement} element
 * @param {number} position
 */
export function setCaretPosition(selection, element, position) {
  if (element) {
    const range = document.createRange();
    const textNode = element.firstChild;
    if (textNode) {
      range.setStart(textNode, Math.min(position, textNode.length));
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
/**
 *
 * @param {HTMLElement} element
 */
export function setCaretPositionAtEnd(element) {
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

/**
 *
 * @param {HTMLElement} that
 * @param {String} eventName
 * @param {JSON} eventDetails
 */
export async function emitCustomEvent(that, eventName, eventDetails) {
  that.dispatchEvent(new CustomEvent(eventName, {
    bubbles: true,
    composed: true,
    detail: eventDetails
  }));
};
/**
 *
 * @param {HTMLElement} that
 * @param {Boolean} state
 */
export async function toggleSpinningCircle(that, state) {
  console.log("...");
  emitCustomEvent(that, eventNames.TOGGLE_SPINNING_CIRCLE.description, {
    bubbles: true,
    composed: true,
    state: state
  });
}
/**
 *
 * @param {HTMLElement} that
 * @param {String} targetUrl
 */
export async function emitNavigationEvent(that, targetUrl, stateData) {
  emitCustomEvent(that, eventNames.NAVIGATE.description, {
    bubbles: true,
    composed: true,
    target: targetUrl,
    stateData: stateData
  });
}
/**
 *
 * @param {HTMLElement} that
 * @param {String} webComponent
 * @param {JSON} data
 * @param {function} confirmCb
 * @param {function} cancelCb
 */
export async function emitDialogEvent(that, webComponent, data, confirmCb, cancelCb) {
  emitCustomEvent(that, eventNames.DIALOG_OPEN.description, {
    bubbles: true,
    composed: true,
    element: webComponent,
    data: data,
    confirmCb: confirmCb,
    cancelCb: cancelCb
  });
}
export async function emitDialogConfirmEvent(that, data) {
  emitCustomEvent(that, eventNames.DIALOG_CONFIRM.description, {
    bubbles: true,
    composed: true,
    data: data
  });
}
export async function emitDialogCancelEvent(that) {
  emitCustomEvent(that, eventNames.DIALOG_CANCEL.description, {
    bubbles: true,
    composed: true
  });
}
/**
 * @param {HTMLElement} that
 * @param {String} route
 */
export async function emitSubPageContainerEvent(that, route) {
  setTimeout(() => {
    emitCustomEvent(that, eventNames.SUB_PAGE_CONTAINER.description, {
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

/**
 *
 * @param {HTMLElement} element
 * @param {String} cssProperty
 * @returns
 */
export function getNumberFromPixelValue(element, cssProperty) {
  const style = getComputedStyle(element);
  const size = style.getPropertyValue(cssProperty);
  let len = size.length;
  let num = size.substring(0, len);
  return parseFloat(num);
}
