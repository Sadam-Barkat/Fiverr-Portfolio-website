import { useEffect } from "react";

type Props = {
  title: string;
  description: string;
  image?: string;
  canonical?: string;
};

const setMeta = (name: string, content: string, attr = "name") => {
  const selector = `meta[${attr}="${name}"]`;
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attr, name);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
};

const setLink = (rel: string, href: string) => {
  let element = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", rel);
    document.head.appendChild(element);
  }
  element.setAttribute("href", href);
};

export default function Seo({ title, description, image, canonical }: Props) {
  useEffect(() => {
    document.title = title;
    setMeta("description", description);
    setMeta("og:title", title, "property");
    setMeta("og:description", description, "property");
    setMeta("og:type", "website", "property");
    setMeta("twitter:card", image ? "summary_large_image" : "summary");
    setMeta("twitter:title", title);
    setMeta("twitter:description", description);

    if (image) {
      setMeta("og:image", image, "property");
      setMeta("twitter:image", image);
    }

    if (canonical) {
      setLink("canonical", canonical);
    }
  }, [canonical, description, image, title]);

  return null;
}