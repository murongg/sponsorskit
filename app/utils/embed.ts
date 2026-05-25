export function buildReadmeEmbed(siteUrl: string): string {
  const normalizedUrl = siteUrl.replace(/\/+$/, "");
  return `[![Sponsors](${normalizedUrl}/sponsors.svg)](${normalizedUrl})`;
}
