import { IBaseRepository } from './base-repository.interface';

export abstract class AbstractBaseRepository<Input, Output> implements IBaseRepository<Input, Output> {
  abstract findAll(query: Partial<Input>): Promise<Output[]>;

  abstract findOne(query: Partial<Input>): Promise<Output | null>;

  abstract create(data: Input): Promise<Output>;

  abstract delete(id: string): Promise<boolean>;

  abstract update(data: Partial<Input>): Promise<Output | null>;
}
