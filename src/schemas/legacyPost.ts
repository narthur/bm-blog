import { z } from "zod";
import readLegacyData from "../lib/readLegacyData";

export const legacyPostInput = z
  .object({
    ID: z.string(),
    Title: z.string(),
    Date: z.string(),
    Tags: z.string(),
    expost_source_url: z.string(),
    dsq_thread_id: z.string(),
    "Author Username": z.string(),
    Slug: z.string(),
    "Comment Status": z.enum(["open", "closed"]),
    "Ping Status": z.enum(["open", "closed"]),
    "Post Modified Date": z.string(),
    Status: z.enum(["publish", "pending", "draft"]),
  })
  .partial();

export const legacyPost = z
  .string()
  .transform((url) => readLegacyData().find((p) => p.expost_source_url === url))
  .pipe(legacyPostInput.optional())
  .transform(
    (wp) =>
      wp && {
        id: Number(wp.ID),
        title: wp.Title,
        date: wp.Date ? new Date(wp.Date) : undefined,
        tags: wp.Tags ? String(wp.Tags).split("|").filter(Boolean) : [],
        source: wp.expost_source_url,
        disqus_id: Number(wp.dsq_thread_id),
        author: wp["Author Username"],
        slug: wp.Slug,
        commentStatus: wp["Comment Status"],
        pingStatus: wp["Ping Status"],
        dateModified: wp["Post Modified Date"]
          ? new Date(wp["Post Modified Date"])
          : undefined,
        status: wp.Status,
      }
  );

export type LegacyPost = z.infer<typeof legacyPost>;
export type LegacyPostInput = z.infer<typeof legacyPostInput>;
