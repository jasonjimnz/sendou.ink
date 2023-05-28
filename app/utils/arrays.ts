// TODO: when more examples of permissions profile difference between
// this implementation and one that takes arrays
// (not all arrays need to necessarily run but they need to be defined)
export function allTruthy(arr: unknown[]) {
  return arr.every(Boolean);
}

/** Mimics Array.prototype.at except throws an error if index out of bounds */
export function atOrError<T>(arr: T[], n: number) {
  const result = at(arr, n);
  if (result === undefined) {
    throw new Error(`Index ${n} out of bounds. Array length is ${arr.length}`);
  }
  return result;
}

// https://github.com/tc39/proposal-relative-indexing-method#polyfill
/** Array.at polyfill */
function at<T>(arr: T[], n: number) {
  // ToInteger() abstract op
  n = Math.trunc(n) || 0;
  // Allow negative indexing from the end
  if (n < 0) n += arr.length;
  // OOB access is guaranteed to return undefined
  if (n < 0 || n >= arr.length) return undefined;
  // Otherwise, this is just normal property access
  return arr[n];
}

export function joinListToNaturalString(arg: string[], lastSeparator = "and") {
  const list = [...arg];
  const last = list.pop();
  const commaJoined = list.join(", ");

  return last ? `${commaJoined} ${lastSeparator} ${last}` : commaJoined;
}

export function normalizeFormFieldArray(
  value: undefined | null | string | string[]
): string[] {
  return value == null ? [] : typeof value === "string" ? [value] : value;
}

/** Can be used as a strongly typed array filter */
export function isDefined<T>(value: T | undefined | null): value is T {
  return value !== null && value !== undefined;
}

export function removeDuplicates<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}

export function removeDuplicatesByProperty<T>(
  arr: T[],
  getter: (arg0: T) => number | string
): T[] {
  const seen = new Set();
  return arr.filter((item) => {
    const id = getter(item);

    if (seen.has(id)) return false;
    seen.add(id);

    return true;
  });
}
