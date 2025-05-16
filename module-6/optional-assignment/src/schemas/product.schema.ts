import { gql } from 'graphql-tag';

export const productTypeDefs = gql`
  type Product {
    id: ID!
    name: String!
    description: String
    price: Float!
    inStock: Boolean!
    store: String!
    addedAt: String!
  }

  type WishlistSummary {
    mostExpensive: Product
    averagePrice: Float
    totalCost: Float
    totalItems: Int
  }

  type Query {
    products(page: Int, limit: Int, name: String, sortByPrice: String): [Product!]!
    product(id: ID!): Product
    wishlistSummary: WishlistSummary!
  }

  type Mutation {
    addProduct(
      name: String!
      description: String
      price: Float!
      inStock: Boolean!
      store: String!
    ): Product!
    
    updateProduct(
      id: ID!
      name: String
      description: String
      price: Float
      inStock: Boolean
      store: String
    ): Product
    
    deleteProduct(id: ID!): Boolean
    exportToCSV: String
  }
`;
