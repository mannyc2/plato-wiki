// Page sources are Markdown files imported as text, as Bun bundles them.
declare module "*.md" {
  const text: string;
  export default text;
}
