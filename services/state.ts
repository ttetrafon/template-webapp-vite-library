import { cloneDeep } from "lodash";
import { generalNames } from "../data/enums.ts";
import { jsonRequest } from '../helper/requests.ts';

type ObservableEntry = {
  proxy: Record<string, any>;
  listeners: Record<string, (subscriber: string, property: string, newValue: unknown) => void>;
};

class State {
  static instance: State;
  #observables: Record<string, ObservableEntry> = {};
  #gameConnection: symbol;
  #observablesBroadcastChannel: BroadcastChannel;
  #pageRunAt: number;
  #requestedState: boolean = false;

  constructor() {
    // console.log(`---> State()`);
    if (!State.instance) {
      // console.log("... instance found!");
      State.instance = this;
    }

    this.#gameConnection = generalNames.CONNECTION_SOLO;
    this.#pageRunAt = new Date().valueOf();
    // console.log(this.#pageRunAt);

    this.#observablesBroadcastChannel = new BroadcastChannel('my_app_channel');
    this.#observablesBroadcastChannel.onmessage = (event) => {
      this.receiveBroadcastedMessage(event);
    }

    this.#requestedState = true;
    this.broadcastMessage({
      type: generalNames.BROADCAST_TYPE_REQUEST_STATE.description,
      time: this.#pageRunAt
    });
    this.collectState();
    return State.instance;
  }

  async broadcastMessage(msg: object) {
    this.#observablesBroadcastChannel.postMessage(JSON.stringify(msg));
  }

  collectState(): Record<string, unknown> {
    console.log(`---> collectState()`);
    let state: Record<string, unknown> = {};
    let keys = Object.keys(this.#observables);
    for (let i = 0; i < keys.length; i++) {
      state[keys[i]] = cloneDeep(this.#observables[keys[i]].proxy);
    }
    // console.log(state);
    return state;
  }

  createObservable(observable: string, obj: object, broadcastCreation = true) {
    let onChange = (property: string, newValue: unknown) => {
      // console.log(`Property '${property}' changed to:`, newValue, "... calling subscribers!");
      Object.keys(this.#observables[observable].listeners).forEach(subscriber =>
        this.#observables[observable].listeners[subscriber](subscriber, property, newValue)
      );
    };

    let proxy = new Proxy(obj as Record<string, any>, {
      get(target, prop, receiver) {
        const value = target[prop as string];
        if (value instanceof Function) {
          return function(...args: unknown[]) {
            return value.apply(this === receiver ? target : this, args);
          };
        }
        return value;
      },
      set(target, prop, value, receiver) {
        if (target[prop as string] !== value) {
          onChange(prop as string, value);
        }
        return Reflect.set(target, prop, value, receiver);
      },
      deleteProperty(target, prop) {
        onChange(prop as string, undefined);
        return Reflect.deleteProperty(target, prop);
      }
    });

    this.#observables[observable] = {
      proxy: proxy,
      listeners: {}
    }

    if (broadcastCreation) this.broadcastMessage({
      type: generalNames.BROADCAST_TYPE_CREATE_OBSERVABLE.description,
      name: observable,
      data: obj
    });
  }

  async getDataFromServer(url: string, observableName: string): Promise<unknown> {
    // console.log(`---> getDataFromServer(${url})`);
    let res = await jsonRequest(url) as Record<string, any>;

    if (res.completionCode == 0) {
      delete res.completionCode;
      delete res.completionMessage;
      this.createObservable(observableName, res);
    }
    else {
      // TODO: display appropriate error!
      res = {};
    }

    return res;
  }

  async getObservable(observable: string): Promise<unknown> {
    console.log(`---> getObservable(${observable})`);
    if (Object.prototype.hasOwnProperty.call(this.#observables, observable)) {
      return cloneDeep(this.#observables[observable].proxy);
    } else {
      return {};
    }
  }

  async getValueFromObservable(observable: string, prop: string): Promise<unknown> {
    // console.log(`---> getValueFromObservable(${observable}, ${prop})`);
    if (Object.prototype.hasOwnProperty.call(this.#observables, observable)) {
      let value = this.#observables[observable].proxy[prop];
      return cloneDeep(value);
    }
    return null;
  }

  async pingServer(url: string): Promise<void> {
    await jsonRequest(url);
  }

  async publishMessage(url: string, message: unknown, method: symbol): Promise<unknown> {
    // console.log(`---> publishMessage(${url}, ${JSON.stringify(message)})`);
    switch(this.#gameConnection) {
      case generalNames.CONNECTION_LIVE:
        console.log("... ws");
        break;
      case generalNames.CONNECTION_SOLO:
        console.log("... api");
        return await jsonRequest(url, message, method);
      default: // generalNames.CONNECTION_OFFLINE:
        console.log("... local");
        break;
    }
  }

  async receiveBroadcastedMessage(event: MessageEvent) {
    console.log(`---> receiveBroadcastedMessage()`, event);
    let msg = JSON.parse(event.data);
    console.log("msg:", msg);
    switch(msg.type) {
      case generalNames.BROADCAST_TYPE_REQUEST_STATE.description:
        // if the request is from an older page, ignore it
        if (msg.time < this.#pageRunAt) return;
        // then collect all state data and send them!
        this.broadcastMessage({
          type: generalNames.BROADCAST_TYPE_RECEIVE_STATE.description,
          state: this.collectState()
        });
        break;
      case generalNames.BROADCAST_TYPE_RECEIVE_STATE.description:
        if (!this.#requestedState) return;

        this.#requestedState = false;
        let keys = Object.keys(msg.state);

        for (let i = 0; i < keys.length; i++) {
          let key = keys[i];
          let data = msg.state[key];
          if (Object.prototype.hasOwnProperty.call(this.#observables, key)) {
            let props = Object.keys(data);
            for (let j = 0; j < props.length; j++) {
              let prop = props[j];
              this.updateObservable(key, prop, data[prop], false);
            }
          } else {
            this.createObservable(key, data, false);
          }
        }
        break;
      case generalNames.BROADCAST_TYPE_CREATE_OBSERVABLE.description:
        this.createObservable(msg.name, msg.data, false);
        break;
      case generalNames.BROADCAST_TYPE_UPDATE_OBSERVABLE.description:
        this.updateObservable(msg.observable, msg.prop, msg.value, false);
        break;
    }
  }

  async subscribeToObservable(observable: string, subscriber: string, callback: (subscriber: string, property: string, newValue: unknown) => void) {
    if (Object.prototype.hasOwnProperty.call(this.#observables, observable) && !Object.prototype.hasOwnProperty.call(this.#observables[observable].listeners, subscriber)) {
      this.#observables[observable].listeners[subscriber] = callback;
    }
    // console.log(this.#observables[observable]);
  }

  async unsubscribeFromObservable(observable: string, subscriber: string) {
    if (Object.prototype.hasOwnProperty.call(this.#observables, observable) && Object.prototype.hasOwnProperty.call(this.#observables[observable].listeners, subscriber)) {
      delete this.#observables[observable].listeners[subscriber];
    }
  }

  async updateObservable(observable: string, prop: string, value: unknown, broadcastChange = true) {
    // console.log(`---> updateObservable(${observable}, ${prop}, ${JSON.stringify(value)})`);
    if (Object.prototype.hasOwnProperty.call(this.#observables, observable)) {
      this.#observables[observable].proxy[prop] = value;
      if (broadcastChange) this.broadcastMessage({
        type: generalNames.BROADCAST_TYPE_UPDATE_OBSERVABLE.description,
        observable: observable,
        prop: prop,
        value: value
      });
    }
    // console.log(this.#observables[observable]);
  }
}

const instance = new State();
Object.freeze(instance);
export default instance;
