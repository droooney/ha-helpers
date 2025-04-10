import { promisify } from "node:util";
import { open } from "openurl";

export function convertObjectToArray<T>(object: Record<string, T>): T[] {
  const array: T[] = [];

  for (const key in object) {
    const parsed = parseInt(key);

    if (array.length === parsed) {
      array.push(object[key]);
    }
  }

  return array;
}

export function parseInt(value: string): number {
  const parsed1 = Number(value);
  const parsed2 = Number.parseInt(value);

  return parsed1 === parsed2 ? parsed1 : NaN;
}

export function parseBigint(value: string | number): bigint | null {
  try {
    return BigInt(value);
  } catch (err) {
    return null;
  }
}

export const openUrl = promisify(open);
