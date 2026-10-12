import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// One JSON file per collection in data/store/ (D8: files, not a database).
// bigint values are stored as strings by the callers.
export type Store = {
  read<T>(collection: string): T[];
  append<T>(collection: string, item: T): void;
  write<T>(collection: string, items: T[]): void;
};

export function createStore(dir: string): Store {
  mkdirSync(dir, { recursive: true });
  const file = (collection: string) => join(dir, `${collection}.json`);
  return {
    read<T>(collection: string): T[] {
      if (!existsSync(file(collection))) return [];
      return JSON.parse(readFileSync(file(collection), "utf8")) as T[];
    },
    append<T>(collection: string, item: T) {
      this.write(collection, [...this.read<T>(collection), item]);
    },
    write<T>(collection: string, items: T[]) {
      writeFileSync(file(collection), JSON.stringify(items, null, 2));
    },
  };
}
