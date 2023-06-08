import { readFileSync } from "fs";
import { describe, it, expect, beforeEach, vi } from "vitest";
import getArchives from "./getArchives";
import getLegacyData from "./getLegacyData";
import { __reset } from "./getPosts";

describe("getArchives", () => {
  beforeEach(() => {
    __reset();
    vi.mocked(readFileSync).mockReturnValue("https://padm.us/psychpricing");

    vi.mocked(getLegacyData).mockResolvedValue([
      {
        Date: "2011-01-24",
        Slug: "psychpricing",
        expost_source_url: "https://padm.us/psychpricing",
      },
    ]);
  });

  it("gets archives", async () => {
    const result = await getArchives();

    expect(result[2011]).toBeDefined();
  });

  it("batches by month", async () => {
    const result = await getArchives();

    expect(result[2011]?.months[0]?.posts).toHaveLength(1);
  });

  it("sets month label", async () => {
    const result = await getArchives();

    expect(result[2011]?.months[0]?.label).toEqual("January");
  });

  it("properly batches by year", async () => {
    vi.mocked(getLegacyData).mockResolvedValue([
      {
        Date: "2013-02-22",
        Slug: "psychpricing",
        expost_source_url: "https://padm.us/psychpricing",
      },
      {
        Date: "2015-02-22",
        Slug: "psychpricing",
        expost_source_url: "https://padm.us/second",
      },
    ]);

    vi.mocked(readFileSync).mockReturnValue(`
https://padm.us/psychpricing
https://padm.us/second
`);

    const result = await getArchives();

    expect(result[2013]?.months[1]?.posts).toHaveLength(1);
  });
});
