import { productData } from "../data/product.data.js";
import { Product } from "../models/product.model.js";
import { writeFileSync } from "fs";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";

let wishlistProducts: Product[] = productData;

export const productResolvers = {
  Query: {
    products: (_: any, { page = 1, limit = 10, name, sortByPrice }: any) => {
      let filtered = [...wishlistProducts];

      if (name) {
        filtered = filtered.filter((p) =>
          p.name.toLowerCase().includes(name.toLowerCase())
        );
      }

      if (sortByPrice === "asc") {
        filtered.sort((a, b) => a.price - b.price);
      } else if (sortByPrice === "desc") {
        filtered.sort((a, b) => b.price - a.price);
      }

      const start = (page - 1) * limit;
      const end = start + limit;
      return filtered.slice(start, end);
    },

    product: (_: any, { id }: { id: string }) =>
      wishlistProducts.find((p) => p.id === id),

    wishlistSummary: () => {
      if (wishlistProducts.length === 0) return null;

      const summary = wishlistProducts.reduce(
        (acc, product) => {
          if (product.price > acc.mostExpensive.price) {
            acc.mostExpensive = product;
          }
          acc.totalCost += product.price;
          acc.totalItems += 1;
          return acc;
        },
        {
          mostExpensive: wishlistProducts[0],
          totalCost: 0,
          totalItems: 0,
        }
      );

      return {
        mostExpensive: summary.mostExpensive,
        averagePrice: summary.totalCost / summary.totalItems,
        totalCost: summary.totalCost,
        totalItems: summary.totalItems,
      };
    },
  },

  Mutation: {
    addProduct: (
      _: any,
      {
        name,
        description,
        price,
        inStock,
        store,
      }: Omit<Product, "id" | "addedAt">
    ): Product => {
      const newProduct: Product = {
        id: uuidv4(),
        name,
        description,
        price,
        inStock,
        store,
        addedAt: new Date().toISOString(),
      };
      wishlistProducts.push(newProduct);
      return newProduct;
    },

    updateProduct: (
      _: any,
      { id, ...rest }: Partial<Product> & { id: string }
    ): Product | null => {
      const index = wishlistProducts.findIndex((p) => p.id === id);
      if (index === -1) return null;

      wishlistProducts[index] = {
        ...wishlistProducts[index],
        ...rest,
      };

      return wishlistProducts[index];
    },

    deleteProduct: (_: any, { id }: { id: string }): boolean => {
      const index = wishlistProducts.findIndex((p) => p.id === id);
      if (index === -1) return false;
      wishlistProducts.splice(index, 1);
      return true;
    },

    exportToCSV: () => {
      const CSV_EXPORT_URL = process.env.CSV_EXPORT_URL;
      const headers = "id,name,description,price,inStock,store,addedAt\n";
      const rows = wishlistProducts
        .map(
          (p) =>
            `${p.id},"${p.name}","${p.description ?? ""}",${p.price},${p.inStock},"${p.store}","${p.addedAt}"`
        )
        .join("\n");

      const csv = headers + rows;
      const filePath = join(process.cwd(), "wishlist.csv");
      writeFileSync(filePath, csv);
      return `wishlist.csv created, please download it at ${CSV_EXPORT_URL}`;
    },
  },
};
