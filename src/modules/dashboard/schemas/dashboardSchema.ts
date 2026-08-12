import { z } from "zod";

export const getDashboardSchema = z.object({
  query: z.object({
    days: z.coerce.number().int().positive().default(30),
    /* recentInventoriesLimit: z.coerce.number().int().positive().max(50).default(5),
        recentProductsLimit: z.coerce.number().int().positive().max(50).default(5), */
  }),
});

export type GetDashboardQuery = z.infer<typeof getDashboardSchema>["query"];
