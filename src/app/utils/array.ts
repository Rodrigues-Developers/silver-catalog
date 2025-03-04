// check if all elements in an array are null or undefined
export function isAllNullOrUndefined(arr: any[]): boolean {
  return arr.every((el) => el === null || el === undefined);
}
