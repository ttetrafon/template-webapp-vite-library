import styles from '../../styles/style.css?inline';
import { eventNames } from '../data/enums.ts';
import defaultStyles from '../styles/content-filters.css?inline';

const _name = 'content-filters';
const template = document.createElement('template');

template.innerHTML = /*html*/`
<style>
  ${ styles }
  ${ defaultStyles }

  :host {
    display: flex;
    flex-flow: column nowrap;
    align-items: stretch;
    width: 100%;
  }

  h3 {
    position: relative;
    justify-content: space-between;
    width: 100%;
  }

  h3 span {
    font-size: 1em;
    font-style: italic;
  }

  h3 .flex-separator {
    min-width: 16px;
  }

  h3 button-text-image {
    height: 1.2em;
    font-size: 0.85em;
  }
</style>

<h3 class="flex-line">
  <span id="label">Filters?!</span>
  <span class="flex-separator"></span>
  <button-text-image
    image="close_small"
    label="clear"
    event-name=${ eventNames.CONTENT_FILTER_CLEAR.description }
  ></button-text-image>
</h3>

<div id="filters-container"></div>
`;

class Component extends HTMLElement {
  private _shadow: ShadowRoot;
  private $label: HTMLElement;
  private $filtersContainer: HTMLElement;

  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'closed' });
    this._shadow.appendChild(template.content.cloneNode(true));

    this.$label = this._shadow.getElementById("label")!;
    this.$filtersContainer = this._shadow.getElementById("filters-container")!;
  }

  static get observedAttributes() { return ['label', 'data', 'custom-styles']; }

  get customStyles() { return this.getAttribute('custom-styles'); }
  get data() { return JSON.parse(this.getAttribute('data')!); }
  get label() { return this.getAttribute('label'); }

  set customStyles(value: string | null) { this.setAttribute('custom-styles', value!); }
  set data(value: unknown) { this.setAttribute('data', value as string); }
  set label(value: string | null) { this.setAttribute('label', value!); }

  attributeChangedCallback(name: string, oldVal: string, newVal: string) {
    if (oldVal == newVal) return;
    switch (name) {
      case 'custom-styles':
        this._loadCustomStyleSheet();
        break;
      case 'data':
        this.loadFilterData();
        break;
      case 'label':
        this.$label.innerText = this.label!;
        break;
    }
  }
  connectedCallback() {
  }
  disconnectedCallback() {
  }
  adoptedCallback() {
  }
  _loadCustomStyleSheet() {
    if (!this.customStyles) return;

    try {
      const linkElement = document.createElement('link');
      linkElement.setAttribute('rel', 'stylesheet');
      linkElement.setAttribute('href', this.customStyles);

      this._shadow.appendChild(linkElement);
    }
    catch (err) { }
  }

  async loadFilterData() {
    this.data.forEach((filter: any) => {
      // console.log("... filter:", filter);
      let f = document.createElement(`content-filter`);
      // TODO: should also accept and pass a map (type -> component-name) for population of custom components as filters
      f.setAttribute("filter-id", filter.id);
      f.setAttribute("label", filter.display);
      f.setAttribute("type", filter.type);
      f.setAttribute("data", JSON.stringify(filter.values));
      if (filter.defaultOpen) {
        f.setAttribute("open", String(true));
      }
      this.$filtersContainer.appendChild(f);
    });
  }
}

window.customElements.define(_name, Component);
