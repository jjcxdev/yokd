export const MDXComponents = {
  h1: ({ ...props }) => (
    <h1
      className="mb-4 mt-6 w-fit border-b-2 border-b-accent text-5xl font-bold"
      {...props}
    />
  ),
  h2: ({ ...props }) => (
    <h2
      className="mb-3 mt-5 w-fit bg-accent text-2xl font-bold text-background"
      {...props}
    />
  ),
  h3: ({ ...props }) => (
    <h3
      className="mb-2 mt-4 w-fit border-b border-b-accent text-xl"
      {...props}
    />
  ),
  h4: ({ ...props }) => (
    <h4
      className="mb-2 mt-3 w-fit bg-accent text-lg font-bold text-background"
      {...props}
    />
  ),
  h5: ({ ...props }) => (
    <h5
      className="mb-1 mt-2 w-fit bg-accent text-base font-bold text-background"
      {...props}
    />
  ),
  h6: ({ ...props }) => (
    <h6
      className="mb-1 mt-1 text-sm font-light italic text-dimmed"
      {...props}
    />
  ),
  p: ({ ...props }) => <p className="mb-4" {...props} />,
  a: ({ ...props }) => <a className="text-accent hover:underline" {...props} />,
  ul: ({ ...props }) => (
    <ul className="mb-4 list-disc pl-6 marker:text-accent" {...props} />
  ),
  ol: ({ ...props }) => (
    <ol className="mb-4 list-decimal pl-6 marker:text-accent" {...props} />
  ),
  li: ({ ...props }) => <li className="mb-2" {...props} />,
  blockquote: ({ ...props }) => (
    <blockquote
      className="mb-4 border-l-4 border-gray-300 pl-4 italic"
      {...props}
    />
  ),
  pre: ({ ...props }) => (
    <pre className="overflow-auto rounded bg-gray-200 p-2" {...props} />
  ),
  code: ({ ...props }) => (
    <code className="rounded bg-gray-200 p-1" {...props} />
  ),
  img: ({ ...props }) => <img className="mx-auto" {...props} alt="" />,
  table: ({ ...props }) => (
    <table className="mb-4 w-full table-auto" {...props} />
  ),
  th: ({ ...props }) => <th className="border px-4 py-2" {...props} />,
  td: ({ ...props }) => <td className="border px-4 py-2" {...props} />,
  hr: ({ ...props }) => <hr className="my-4" {...props} />,
} as const;
