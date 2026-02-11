import { FilterQuery, Model, PopulateOptions, QueryOptions, UpdateQuery } from 'mongoose';
import type { UpdateResult } from 'mongodb';

export type MongoQueryOptions = Partial<
  QueryOptions & { noTransform?: boolean; populate?: PopulateOptions | (PopulateOptions | string)[] }
>;

export interface MongoRepositoryInterface<ModelType, Output> {
  getList: (filter: FilterQuery<ModelType>) => Promise<Output[]>;
  findAll: (query: FindAllOptions<ModelType>, options?: MongoQueryOptions) => Promise<Output[]>;

  findOne: (query: FilterQuery<Partial<ModelType>>, options?: MongoQueryOptions) => Promise<Output | null>;

  updateOne: (
    query: FilterQuery<ModelType>,
    data: UpdateQuery<ModelType>,
    options?: MongoQueryOptions,
  ) => Promise<UpdateResult>;

  create: (data: Partial<ModelType>) => Promise<Output>;

  update: (data: Partial<ModelType>, options?: QueryOptions) => Promise<Output | null>;

  updateMany: (
    filter: FilterQuery<Partial<ModelType>>,
    data: UpdateQuery<ModelType>,
    options?: Record<any, any>,
  ) => Promise<any | null>;

  delete: (id: string) => Promise<boolean>;

  count: (query: Record<string, any>) => Promise<number>;

  getModel: () => Model<ModelType>;
}

export type FindAllOptions<T> = FilterQuery<T> & {
  offset?: number;
  limit?: number;
  orderBy?: any;
};
