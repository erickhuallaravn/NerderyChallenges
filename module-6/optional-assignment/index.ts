import { ApolloServer } from "@apollo/server";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { expressMiddleware } from "@as-integrations/express5";
import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import { join } from "path";
import { existsSync } from "fs";
import { typeDefs } from "./src/graphql/schema.js";
import { resolvers } from "./src/graphql/resolvers.js";

dotenv.config();

interface MyContext {
  token?: string;
}

async function startServer() {
  const PORT = process.env.PORT || 4000;
  const app = express();
  const httpServer = http.createServer(app);

  const server = new ApolloServer<MyContext>({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });
  await server.start();

  app.use(
    "/graphql",
    cors<cors.CorsRequest>(),
    express.json(),
    expressMiddleware(
      server
      // In case auth was implemented
      /*, {
      context: async ({ req }: any) => ({ token: req.headers.token }),
    }*/
    )
  );

  app.get("/download-wishlist", (req, res) => {
    const filePath = join(process.cwd(), "wishlist.csv");
    if (!existsSync(filePath)) {
      return res.status(404).json({
        message:
          "El archivo wishlist.csv no existe. Por favor, genera el CSV primero.",
      });
    }
    res.download(filePath, "wishlist.csv", (err) => {
      if (err) {
        console.error("Error al descargar el archivo:", err);
        res.status(500).json({ message: "Error al descargar el archivo." });
      }
    });
  });

  await new Promise<void>((resolve) =>
    httpServer.listen({ port: PORT }, resolve)
  );
  console.log(`Server ready at http://localhost:${PORT}/graphql`);
}

startServer();
