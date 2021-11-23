import { db } from './json-db';

export class Collection<T extends { id: string }> {

  constructor(private name: string) {}

  async save(item: T): Promise<T> {
    db.push(`/${this.name}[]`, item)
    return item;
  }

  async getAll(): Promise<T[]> {
    return db.getObject(`/${this.name}`) || [];
  }

  async findOne(filter: (item: T) => boolean): Promise<T | undefined> {
    return db.find<T>(`/${this.name}[]`, filter);
  }

  async findById(id: string): Promise<T | undefined> {
    return db.find<T>(`/${this.name}[]`,(value) => value.id === id);
  }

  async findMany(filter: (item: T) => boolean): Promise<T[]> {
    return db.filter<T>(`/${this.name}[]`, filter) || [];
  }

  async delete(id: string): Promise<void> {
    return db.push(this.name, await this.findMany((value) => value.id === id), true);
  }
}
