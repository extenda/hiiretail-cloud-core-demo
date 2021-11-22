export class Collection<T extends { id: string }> {
  private data: Record<string, T> = {};

  async save(item: T): Promise<T> {
    this.data[item.id] = item;
    return item;
  }

  async getAll(): Promise<T[]> {
    return Object.values(this.data);
  }

  async getById(id: string): Promise<T | undefined> {
    return this.data[id];
  }

  async findOne(filter: (item: T) => boolean): Promise<T | undefined> {
    return Object.values(this.data).find(filter);
  }

  async findMany(filter: (item: T) => boolean): Promise<T[]> {
    return Object.values(this.data).filter(filter);
  }

  async delete(id: string): Promise<T> {
    const item = this.data[id];
    delete this.data[id];
    return item;
  }
}
