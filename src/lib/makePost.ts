import parseMarkdown from "./parseMarkdown";
import fetchPost from "./fetchPost";
import getLegacyData from "./getLegacyData";

export type Post = {
  url: string;
  title: string;
  content: string;
  slug: string;
  tags: string[];
  date: Date;
  author: string;
  disqus: {
    id: string;
    url: string;
  };
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
  const slug = wp?.Slug;

  if (typeof slug !== "string") {
    throw new Error(`Invalid slug for ${url}`);
  }

  return {
    ...parseMarkdown(markdown),
    slug,
    tags: String(wp?.Tags || "")
      .split("|")
      .filter(Boolean),
    date: new Date(String(wp?.Date)),
    url: formattedUrl,
    author: String(wp?.["Author Username"]),
    disqus: {
      id: `${wp?.ID} https://blog.beeminder.com/?p=${wp?.ID}`,
      url: `https://blog.beeminder.com/${slug}/`,
    },
  };
}
