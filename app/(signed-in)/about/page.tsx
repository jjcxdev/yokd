import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { MDXComponents } from "@/app/components/MDXComponents";

const markdownContent = `
# About YOKD

## What is YOKD?
YOKD is a strength training tracking app built with a simple goal: to be the tool we wanted but couldn't find. No unnecessary features, no bloat – just effective tracking that works the way you need it to.

## Why we built it
We couldn't find a tracking app that did exactly what we wanted. Rather than settling for "close enough," we decided to build something better. Something that focuses on what matters: tracking your training effectively.

## Our approach
- **Function over fluff**: Every feature has a purpose. If it doesn't make tracking easier or more effective, it doesn't make the cut.
- **Works everywhere**: Use YOKD seamlessly on your phone while training or on your computer when planning workouts. As a progressive web app, it works on any device with a web browser.
- **User-driven development**: We actively listen to user feedback and implement changes that make the app better for everyone. While we can't add every requested feature, we're committed to thoughtful improvements that serve the broader community.

## Our goal
We want YOKD to be the go-to app for anyone serious about strength training. Whether you're tracking your daily workouts or planning long-term progress, YOKD is built to support your training journey without getting in your way.

## Contact
Have feedback or suggestions? We'd love to hear from you at [j@jjcx.dev](mailto:j@jjcx.dev).

---

YOKD is proudly built in Canada 🇨🇦
`;

export default function About() {
  return (
    <div className="flex w-full justify-center px-2 pb-20">
      <div className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl mx-auto w-full max-w-5xl">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={MDXComponents}>
          {markdownContent}
        </ReactMarkdown>
      </div>
    </div>
  );
}
