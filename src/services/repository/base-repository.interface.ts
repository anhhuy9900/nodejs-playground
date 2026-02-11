export interface IBaseRepository<Input, Output> {
  findAll: (query: Partial<Input>) => Promise<Output[]>;

  findOne: (query: Partial<Input>) => Promise<Output | null>;

  create: (data: Input) => Promise<Output>;

  update: (data: Partial<Input>) => Promise<Output | null>;

  delete: (id: string) => Promise<boolean>;
}
