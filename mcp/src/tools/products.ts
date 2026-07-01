import { z } from "zod";
import { api } from "../api-client";
import type { ToolDef } from "../tool-factory";

export default [
  {
    name: "list_products",
    description: "Lista productos con filtros opcionales y paginación",
    inputSchema: {
      name: z.string().optional(),
      sortBy: z.enum(["id", "name", "price", "stock"]).optional(),
      order: z.enum(["ASC", "DESC", "asc", "desc"]).optional(),
      page: z.number().int().min(1).optional(),
      limit: z.number().int().min(1).max(100).optional(),
    },
    handler: async (args: any) => api.get("/products", { params: args }),
  },
  {
    name: "get_product",
    description: "Obtiene un producto por su ID",
    inputSchema: { id: z.number().int() },
    handler: async ({ id }: any) => api.get(`/products/${id}`),
  },
  {
    name: "create_product",
    description: "Crea un nuevo producto (requiere rol admin)",
    inputSchema: {
      name: z.string().min(1).max(256),
      price: z.number().positive(),
      stock: z.number().int().min(0).optional(),
      categoryId: z.number().int().nullable().optional(),
    },
    handler: async (body: any) => api.post("/products", body),
  },
  {
    name: "update_product",
    description: "Actualiza un producto existente (requiere rol admin)",
    inputSchema: {
      id: z.number().int(),
      name: z.string().min(1).max(256).optional(),
      price: z.number().positive().optional(),
      stock: z.number().int().min(0).optional(),
      categoryId: z.number().int().nullable().optional(),
    },
    handler: async ({ id, ...body }: any) => api.put(`/products/${id}`, body),
  },
  {
    name: "delete_product",
    description: "Elimina un producto existente (requiere rol admin)",
    inputSchema: { id: z.number().int() },
    handler: async ({ id }: any) => api.del(`/products/${id}`),
  },
] as ToolDef[];
