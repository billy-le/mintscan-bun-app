export function BaseHtml({
  title,
  children,
}: {
  title: string;
  children: JSX.Element;
}) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/htmx.org@1.9.6"></script>
    <title>${title}</title>
</head>
${children}
</html>`;
}
