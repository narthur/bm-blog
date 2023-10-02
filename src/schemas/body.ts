import { z } from "zod";
import addBlankLines from "../lib/addBlankLines";
import trimContent from "../lib/trimContent";
import linkFootnotes from "../lib/linkFootnotes";
import expandRefs from "../lib/expandRefs";
import { marked } from "marked";
import { markedSmartypants } from "marked-smartypants";
import applyIdsToElements from "../lib/applyIdsToElements";
// import inlineParagraphs from "../lib/inlineParagraphs";

marked.use(
  markedSmartypants({
    config: "1",
  }),
);

marked.use({
  hooks: {
    postprocess: applyIdsToElements,
    // WORKAROUND: @types/marked incorrectly requires `preprocess` to be defined.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any,
});

export const body = z
  .string()
  .refine((content) => content.includes("BEGIN_MAGIC"), {
    message: "No BEGIN_MAGIC found",
  })
  .refine((content) => content.includes("END_MAGIC"), {
    message: "No END_MAGIC found",
  })
  .transform(trimContent)
  .transform(addBlankLines)
  // TODO: find a fix for mid-paragraph html comments that doesn't break markdown lists
  // .transform(inlineParagraphs)
  .transform(linkFootnotes)
  .transform(expandRefs)
  .transform((md) => marked.parse(md));

export type Body = z.infer<typeof body>;
