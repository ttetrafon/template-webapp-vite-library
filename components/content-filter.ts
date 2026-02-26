import styles from '../../styles/style.css?inline';
import { generalNames } from '../data/enums.ts';
import defaultStyles from '../styles/---.css?inline';

const _name = 'content-filter';
const template = document.createElement('template');

template.innerHTML = /*html*/`
<style>
  ${ styles }
  ${ defaultStyles }

  :host {
    display: block;
    width: 100%;
  }

  details {
    align-items: flex-start;
  }

  summary {
    cursor: pointer;
    font-size: 1em;
    color: var(--colour-tertiary);
  }

  @media (prefers-color-scheme: light) {
    summary {
      color: var(--colour-secondary);
    }
  }
</style>

<details class="flex-column">
  <summary></summary>
</details>
`;

class Component extends HTMLElement {
  private _shadow: ShadowRoot;
  private $details: HTMLDetailsElement;
  private $title: HTMLElement;
  private $content: HTMLElement | null = null;
  private $entries: HTMLElement[] = [];

  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'closed' });
    this._shadow.appendChild(template.content.cloneNode(true));

    this.$details = this._shadow.querySelector('details')!;
    this.$title = this._shadow.querySelector('summary')!;
  }

  static get observedAttributes() { return ['filter-id', 'label', 'type', 'data', 'custom-styles', 'open']; }

  get customStyles() { return this.getAttribute('custom-styles'); }
  get data() { return JSON.parse(this.getAttribute('data')!); }
  get filterId() { return this.getAttribute('filter-id'); }
  get label() { return this.getAttribute('label'); }
  get open() { return this.hasAttribute('open'); }
  get type() { return this.getAttribute('type'); }

  set customStyles(value: string | null) { this.setAttribute('custom-styles', value!); }
  set data(value: unknown) { this.setAttribute('data', value as string); }
  set filterId(value: string | null) { this.setAttribute('filter-id', value!); }
  set label(value: string | null) { this.setAttribute('label', value!); }
  set open(value: boolean) { this.toggleAttribute('open', Boolean(value)); }
  set type(value: string | null) { this.setAttribute('type', value!); }

  attributeChangedCallback(name: string, oldVal: string, newVal: string) {
    if (oldVal == newVal) return;
    switch (name) {
      case 'custom-styles':
        this._loadCustomStyleSheet();
        break;
      case 'data':
        this.createEntries();
        break;
      case 'filter-id':
        // TODO: pass it to all entries for events reference
        break;
      case 'label':
        this.$title.innerText = this.label!;
        break;
      case 'open':
        this.$details.open = this.open;
        break;
      case 'type':
        this.createEntries();
        break;
    }
  }
  connectedCallback() {
    this.$details.open = this.open;
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

  async createEntries() {
    if (!this.type || !this.data) return;

    if (this.$content) {
      this.$content.remove();
      this.$content = null;
    }
    if (this.$entries.length > 0) {
      // TODO: cleanup entries if needed...
    }

    console.log(`... building filter of type '${this.type}' with data:`, this.data);
    switch(this.type) {
      // case generalNames.CONTENT_FILTER_RADIO_MULTI.description:
      //   break;
      case generalNames.CONTENT_FILTER_RADIO_SINGLE.description:
        this.$content = document.createElement("content-filter-radio");
        break;
      default:
        return;
    }

    this.$content.setAttribute("group-id", this.filterId!);
    this.$content.setAttribute("type", this.type);
    this.$content.setAttribute("data", JSON.stringify(this.data));

    this.$details.appendChild(this.$content);
  }
}

window.customElements.define(_name, Component);
