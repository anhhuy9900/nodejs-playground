import { AbstractBaseRepository } from '../abstract-base.repository';
import { FindAllOptions, MongoRepositoryInterface } from './mongo-repository.type';
import { FilterQuery, Model, PopulateOptions, QueryOptions } from 'mongoose';
import type { UpdateFilter, UpdateResult } from 'mongodb';

export class MongoRepository<ModelType, Output>
  extends AbstractBaseRepository<ModelType, Output>
  implements MongoRepositoryInterface<ModelType, Output>
{
  protected model: Model<ModelType>;

  constructor(model: Model<ModelType>) {
    super();
    this.model = model;
  }

  getModel(): Model<ModelType> {
    return this.model;
  }

  async getList(filter: FilterQuery<ModelType> & { populate?: any }): Promise<Output[]> {
    const {
      query = {},
      paging = { from: 0, size: 10 },
      orderBy = { createdAt: 'desc', updatedAt: 'desc' },
      select = '',
      populate = false,
    } = filter;

    let mongooseQuery = this.model.find(query).sort(orderBy).skip(paging.from).limit(paging.size).select(select);

    if (populate) {
      mongooseQuery = mongooseQuery.populate(populate);
    }

    const response = await mongooseQuery.lean().exec();

    return response.map((o: any) => this.transformModel(o));
  }

  async count(query: Record<string, any>): Promise<number> {
    return await this.model.countDocuments(query);
  }

  async findAll(
    query: FindAllOptions<ModelType>,
    options?: Partial<QueryOptions & { populate?: PopulateOptions | (PopulateOptions | string)[] }>,
  ): Promise<Output[]> {
    const { offset = 0, limit = 0, orderBy = null, ...filter } = query;
    if (offset) {
      options = { ...options, skip: offset };
    }
    if (limit) {
      options = { ...options, limit };
    }
    if (orderBy) {
      options = { ...options, sort: orderBy };
    }
    const result = this.model.find(filter as FilterQuery<ModelType>, '', { ...options });
    const response = (await result.lean().exec()) as ModelType[];
    return response.map((o) => this.transformModel(o));
  }

  async findOne(
    query: FilterQuery<Partial<ModelType>>,
    options?: Partial<QueryOptions & { populate?: PopulateOptions | (PopulateOptions | string)[] }>,
  ): Promise<Output | null> {
    const { populate = null, ...queryOptions } = options || {};
    let queryBuilder = this.model.findOne(query, '', { ...queryOptions }).read('primary');
    if (populate) {
      queryBuilder = queryBuilder.populate(populate);
    }
    const result = (await queryBuilder.sort({ _id: -1 }).lean()) as ModelType;
    return result ? this.transformModel(result) : null;
  }

  async create(data: Partial<ModelType>): Promise<Output> {
    const result = await this.model.create(data);
    return this.transformModel(result?.toObject());
  }

  async update(data: Partial<ModelType>, options?: QueryOptions): Promise<Output | null> {
    const { id, ...body } = data as any;
    const updated: ModelType | null = await this.model.findOneAndUpdate(
      { _id: id },
      body as unknown as Partial<ModelType>,
      { new: true, lean: true, ...options }, // Return the updated document
    );

    return updated ? this.transformModel(updated) : null;
  }

  async updateOne(
    filter: FilterQuery<ModelType>,
    update: UpdateFilter<ModelType>,
    options?: Record<any, any>,
  ): Promise<UpdateResult> {
    return await this.model.updateOne(filter, update, options).exec();
  }

  async updateMany(
    filter: FilterQuery<Partial<ModelType>>,
    data: UpdateFilter<ModelType>,
    options?: Record<any, any>,
  ): Promise<any | null> {
    return await this.model.updateMany(filter, data, options).exec();
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.model.deleteOne({ _id: id });
    return !!result;
  }

  protected transformModel(data?: any): Output {
    return data as unknown as Output;
  }
}
