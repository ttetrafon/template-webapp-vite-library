import { eventNames } from "../data/enums.ts";

const spinningCircle = document.createElement("loading-circle");
document.body.appendChild(spinningCircle);
spinningCircle.classList.add("hidden");

document.addEventListener(eventNames.TOGGLE_SPINNING_CIRCLE.description!, (event) => {
  event.stopPropagation();
  spinningCircle.classList.toggle("hidden", !(event as CustomEvent).detail.state);
});
