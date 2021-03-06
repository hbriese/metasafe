import { FieldMiddleware } from '@nestjs/graphql';
import { address, isAddressLike } from 'lib';

export const AddressMiddleware: FieldMiddleware = async (ctx, next) => {
  const value = await next();

  // An address with an invalid checksum will fail this check
  if (isAddressLike(value)) return address(value);

  return value;
};
