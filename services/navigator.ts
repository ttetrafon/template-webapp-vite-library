import { domainRoot } from '../../data/config.ts';
import { routes, aliases } from '../../data/routes.ts';
import { eventNames } from '../data/enums.ts';
import { checkStringForExistence, checkStringForNonExistence } from '../helper/data.ts';
import { clearChildren } from '../helper/dom.ts';

interface RouteInfo {
  content: string;
  title: string;
  description: string;
  canonicalUrl: string;
  structuredData: object;
  navData?: Record<string, unknown>;
}

export class Navigator {
  private container: Element | null;
  private $subPageContainers: Record<string, Element>;
  private dialog: HTMLDialogElement;
  private $dialogConfirmCallback: (data?: unknown) => Promise<void>;
  private $dialogCancelCallback: () => Promise<void>;

  constructor(containerId: string) {
    this.container = document.querySelector(containerId);

    this.$subPageContainers = {};
    this.dialog = document.createElement('dialog');
    this.$dialogConfirmCallback = async () => {};
    this.$dialogCancelCallback = async () => {};

    this.init();
  }

  init() {
    // Handle initial load
    this.navigateTo(window.location.pathname, false);

    // Handle back/forward navigation
    window.addEventListener('popstate', () => {
      this.navigateTo(window.location.pathname, false);
    });

    // Listen for custom navigate events
    window.addEventListener(eventNames.NAVIGATE.description!, (e) => {
      // console.log(`... received navigation event:`, e.detail);
      const ce = e as CustomEvent;
      this.navigateTo(ce.detail.target, true, ce.detail.stateData ? ce.detail.stateData : {});
    });

    const body = document.querySelector("body")!;
    body.appendChild(this.dialog);

    window.addEventListener(eventNames.DIALOG_OPEN.description!, (e) => {
      e.stopImmediatePropagation();
      const ce = e as CustomEvent;
      clearChildren(this.dialog);

      this.$dialogConfirmCallback = ce.detail.confirmCb ? ce.detail.confirmCb : async () => { };
      this.$dialogCancelCallback = ce.detail.cancelCb ? ce.detail.cancelCb : async () => { };

      let el = document.createElement(ce.detail.element);
      for (const [key, value] of Object.entries(ce.detail.data)) {
        el.setAttribute(key, JSON.stringify(value));
      }
      this.dialog.appendChild(el);

      this.dialog.showModal();
    });
    this.dialog.addEventListener(eventNames.DIALOG_CONFIRM.description!, async (event) => {
      // console.log("dialog event:", eventNames.DIALOG_CONFIRM.description)
      event.stopImmediatePropagation();
      this.dialog.close();
      await this.$dialogConfirmCallback((event as CustomEvent).detail.data);

      this.$dialogCancelCallback = async () => { };
      this.$dialogConfirmCallback = async () => { };
    });
    this.dialog.addEventListener(eventNames.DIALOG_CANCEL.description!, async (event) => {
      // console.log("dialog event:", eventNames.DIALOG_CANCEL.description)
      event.stopImmediatePropagation();
      this.dialog.close();
      await this.$dialogCancelCallback();

      this.$dialogCancelCallback = async () => { };
      this.$dialogConfirmCallback = async () => { };
    });
    this.dialog.addEventListener('cancel', async (event) => {
      // console.log("dialog event: cancel");
      event.stopImmediatePropagation();
      this.dialog.close();
      await this.$dialogCancelCallback();

      this.$dialogCancelCallback = async () => { };
      this.$dialogConfirmCallback = async () => { };
    });
  }

  cleanContainers(newPathParts: string[], currentPathParts: string[]) {
    // console.log(`---> cleanContainers(${ JSON.stringify(newPathParts) }, ${ JSON.stringify(currentPathParts) })`);
    for (let newPart of newPathParts) {
      if (!currentPathParts.includes(newPart)) {
        delete this.$subPageContainers[newPart];
      }
    }
    // console.log(`... this.$subPageContainers:`, this.$subPageContainers);
  }

  createCanonicalUrl(path: string): string {
    // console.log(`---> createCanonicalUrl(${ path })`);
    return `${ domainRoot }/${ path }`;
  }

  createContentElement(content: string): string {
    return `<${ content }></${ content }>`;
  }

  getRoute(route: string, pathParts: string[]): RouteInfo {
    let r = routes[route];
    return {
      content: this.createContentElement(r.content),
      title: r.title,
      description: r.description,
      canonicalUrl: this.createCanonicalUrl(pathParts.join("/")),
      structuredData: {
        // https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data
        // https://developers.google.com/search/docs/appearance/structured-data/search-gallery
        "@context": "https://schema.org",
        "@type": r.pathType,
        name: r.title,
        description: r.description,
        url: this.createCanonicalUrl(r.content)
      },
      navData: r.navData
    };
  }

  navigateTo(path: string, pushState = true, stateData: object = {}) {
    // console.log(`navigateTo(${ path }, ${ pushState }, ${ JSON.stringify(stateData) })`);
    if (!this.container) return;

    const currentPath = window.location.pathname;
    const currentPathParts = currentPath.split("/").filter(Boolean);
    // console.log(`... currentPath = ${ currentPath }`, currentPathParts);

    let newPath = this.normalisePath(path);
    if (newPath == "/") {
      newPath = aliases["/"];
    }
    const newPathParts = newPath.split("/").filter(Boolean);
    const numberOfPathParts = newPathParts.length;
    // console.log(`... new path = ${ newPath }}`, newPathParts, numberOfPathParts);

    let parentContainer: Element | null = this.container;
    for (let i = 0; i < numberOfPathParts; i++) {
      let part = newPathParts[i];
      let route = this.getRoute(part, newPathParts);
      // console.log("...", part, route);

      if (part != currentPathParts[i] || !parentContainer.firstChild) {
        // console.log(`... updating part: ${part}`);
        this.updateContent(parentContainer, route.content, route.navData);
      }
      parentContainer = "declareSubContainer" in (parentContainer.firstChild as object) ? (parentContainer.firstChild as any).declareSubContainer() : null;

      if (i == numberOfPathParts - 1) {
        this.updateMetadata(route);
      }
    }

    if (pushState) {
      window.history.pushState({}, '', newPath);
    }
  }

  normalisePath(path: string): string {
    // console.log(`---> normalisePath(${ path })`);
    if (path == "/") return path;
    if (path == "") return "/";
    if (path[path.length - 1] == "/") path = path.slice(0, -1);
    return path;
  }

  updateCanonicalUrl(value: string | null | undefined) {
    // https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel
    if (checkStringForNonExistence(value)) return;

    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.setAttribute("rel", "canonical");
      document.head.appendChild(link);
    }
    link.setAttribute("href", value!);
  }

  updateContent(parentContainer: Element | null, content: string, navData?: Record<string, unknown>) {
    // console.log(`--> updateContent()`, parentContainer, content, navData);
    if (checkStringForNonExistence(content) || !parentContainer) return;

    parentContainer.innerHTML = content;
    if (navData) (parentContainer.firstChild as Element).setAttribute("nav-data", JSON.stringify(navData));
  }

  updateMetadata(route: RouteInfo) {
    // console.log(`--> updateMetadata()`, route);
    if (checkStringForExistence(route.title)) document.title = route.title;
    if (checkStringForExistence(route.description)) document.querySelector('meta[name="description"]')!.setAttribute('content', route.description);
    this.updateCanonicalUrl(route.canonicalUrl);
    this.updateStructuredData(route.structuredData);
  }

  updateStructuredData(data: object | null | undefined) {
    if (data == null || data == undefined) return;

    const existingScript = document.querySelector('script[type="application/ld+json"]');
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
  }
}
