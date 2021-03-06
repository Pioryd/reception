import { FindManyOptions } from "typeorm/find-options/FindManyOptions";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";

import * as Validate from "../util/validate";

import { CustomerPaginatedResponse } from "../types/paginated-response";

import * as Models from "../models";

export async function get(data?: {
  id?: number;
  name?: string;
  email?: string;
  phone?: string;
  created?: string;
  limit?: number;
  page?: number;
}): Promise<CustomerPaginatedResponse> {
  const SEARCH_LIMIT = Number(process.env.SEARCH_LIMIT);

  const totalItems = await Models.Customer.count();
  const totalPages = Math.max(Math.ceil(totalItems / SEARCH_LIMIT), 1);

  let page = 1;
  let limit = SEARCH_LIMIT;

  const findOptions: FindManyOptions<Models.Customer> = {};
  findOptions.where = {};
  findOptions.take = SEARCH_LIMIT;
  findOptions.order = { id: "ASC" };

  if (data != null) {
    if (data.id != null) findOptions.where.id = data.id;
    if (data.name != null) findOptions.where.name = data.name;
    if (data.email != null) findOptions.where.email = data.email;
    if (data.phone != null) findOptions.where.phone = data.phone;
    if (data.created != null) findOptions.where.created = data.created;
    if (data.limit != null) limit = data.limit;
    if (data.page != null) page = data.page;
  }

  limit = Math.max(Math.min(limit, SEARCH_LIMIT), 1);
  page = Math.max(Math.min(page, totalPages), 1);

  findOptions.skip = (page - 1) * SEARCH_LIMIT;
  findOptions.take = limit;

  return Object.assign(new CustomerPaginatedResponse(), {
    items: await Models.Customer.find(findOptions),
    currentPage: page,
    totalPages,
    count: totalItems
  });
}

export async function create(data: {
  name: string;
  email: string;
  phone: string;
}): Promise<Models.Customer> {
  Validate.customer(data);

  const customer = Models.Customer.create({ ...data, created: new Date() });
  await customer.save();

  return customer;
}

export async function remove(data: { id: number }) {
  const customer = await Models.Customer.findOne({ id: data.id });
  await Models.Appointment.delete({ customer });
  await Models.Customer.delete({ id: data.id });
}

export async function update(data: {
  id: number;
  name?: string;
  email?: string;
  phone?: string;
}) {
  const partialEntity: QueryDeepPartialEntity<Models.Customer> = {};
  if (data != null) {
    if (data.name != null) partialEntity.name = data.name;
    if (data.email != null) partialEntity.email = data.email;
    if (data.phone != null) partialEntity.phone = data.phone;
  }
  await Models.Customer.update({ id: data.id }, partialEntity);
}
