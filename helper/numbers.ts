export function roundToTwoDecimals(num: number): string | 0 {
  if (!num) {
    return 0;
  }
  else if (num === Infinity) {
    return 0;
  }
  else if (num === (-Infinity)) {
    return 0;
  }
  return num.toFixed(2);
}

export function roundToInteger(num: number): string | 0 {
  if (!num) {
    return 0;
  }
  else if (num === Infinity) {
    return 0;
  }
  else if (num === (-Infinity)) {
    return 0;
  }
  return num.toFixed(0);
}

export function addLeadingPositiveSign(num: number): string {
  return num > 0 ? `+${num}` : `${num}`
}
