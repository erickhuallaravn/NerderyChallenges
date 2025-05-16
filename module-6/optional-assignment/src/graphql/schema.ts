import { gql } from 'graphql-tag';
import { productTypeDefs } from '../schemas/product.schema.js';

export const typeDefs = gql`
  ${productTypeDefs}
`;
