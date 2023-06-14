import parseMarkdown from "./parseMarkdown";
import fetchPost from "./fetchPost";
import getLegacyData from "./getLegacyData";
import type { Image } from "./getImage";

export type Post = {
  url: string;
  title: string;
  excerpt: string;
  content: string;
  markdown: string;
  slug: string;
  tags: string[];
  date: Date;
  date_string: string;
  author: string;
  disqus: {
    id: string;
    url: string;
  };
  image: Image | undefined;
};

function formatUrl(url: string) {
  const hasSchema = url.startsWith("http");
  const isDtherpad = url.includes("dtherpad.com");

  if (isDtherpad) {
    url = url.replace("dtherpad.com", "padm.us");
  }

  return hasSchema ? url : `https://${url}`;
}

export default async function makePost(url: string): Promise<Post> {
  const wp = await getLegacyData(url);
  const formattedUrl = formatUrl(url);
  const markdown = await fetchPost(formattedUrl);
  const parsed = parseMarkdown(markdown);

  if (!wp?.id && !parsed.excerpt) {
    throw new Error("Custom excerpts are required for new posts.");
  }

  const slug = parsed.slug || wp?.Slug;

  if (typeof slug !== "string") {
    throw new Error(`Invalid slug for ${url}`);
  }

  const date = parsed.date || new Date(String(wp?.Date));
  const date_string = date.toISOString().split("T")[0];

  if (!date_string) {
    throw new Error(`Invalid date for ${url}`);
  }

  const author = parsed.author || wp?.["Author Username"]?.toString() || "";
  const wpTags = String(wp?.Tags || "")
    .split("|")
    .filter(Boolean);

  return {
    ...parsed,
    slug,
    markdown,
    tags: [...parsed.tags, ...wpTags],
    date,
    date_string,
    url: formattedUrl,
    author,
    disqus: {
      id: `${wp?.ID} https://blog.beeminder.com/?p=${wp?.ID}`,
      url: `https://blog.beeminder.com/${slug}/`,
    },
  };
}
