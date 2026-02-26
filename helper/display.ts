export function displayDateAsDDMMYYYY(date: Date): string {
  let str = date.toISOString();
  return `${str.substring(8,10)}/${str.substring(5,7)}/${str.substring(0,4)}`;
}

export function displayDateAsYYYYMMDD(date: Date): string {
  let str = date.toISOString();
  return `${str.substring(0,4)}-${str.substring(5,7)}-${str.substring(8,10)}`;
}

export function displayTimeAsHoursMinutesSeconds(timestamp: number): string {
  let then = new Date(timestamp);
  // 27/09/2024, 15:47:25
  return then.toISOString().substring(11, 19);
}

export function displayTimeAsLocaleString(timestamp: number): string {
  let then = new Date(timestamp);
  let str = then.toISOString();
  // 2024-09-30T08:36:48.826Z
  return `${str.substring(8,10)}-${str.substring(5,7)}-${str.substring(0,4)} ${str.substring(11,19)}`;
}
