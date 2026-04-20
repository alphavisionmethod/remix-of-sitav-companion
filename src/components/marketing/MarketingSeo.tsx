// Shared SEO meta primitive — sets document.title + meta tags
import { useEffect } from "react";

interface Props {
  title: string;
  description: string;
  canonical?: string;
  jsonLd?: Record<string, unknown>;
  ogImage?: string;
}

export function MarketingSeo({ title, description, canonical, jsonLd, ogImage }: Props) {
  useEffect(() => {
    document.title = title;
    const setMeta = (name: string, content: string, attr: "name" | "property" = "name") => {
      let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.content = content;
    };
    setMeta("description", description);
    setMeta("og:title", title, "property");
    setMeta("og:description", description, "property");
    setMeta("og:type", "website", "property");
    if (ogImage) setMeta("og:image", ogImage, "property");
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", title);
    setMeta("twitter:description", description);

    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement("link");
        link.rel = "canonical";
        document.head.appendChild(link);
      }
      link.href = canonical;
    }
    let ld = document.getElementById("marketing-jsonld") as HTMLScriptElement | null;
    if (jsonLd) {
      if (!ld) {
        ld = document.createElement("script");
        ld.type = "application/ld+json";
        ld.id = "marketing-jsonld";
        document.head.appendChild(ld);
      }
      ld.text = JSON.stringify(jsonLd);
    } else if (ld) {
      ld.remove();
    }
  }, [title, description, canonical, ogImage, jsonLd]);
  return null;
}
