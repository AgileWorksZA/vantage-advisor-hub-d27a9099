export function matchTranscript(
  text: string,
  transcription: string | null
): { snippet: string; timestamp: string } | null {
  if (!transcription) return null;
  const keywords = text.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
  const lowerTranscript = transcription.toLowerCase();

  for (const keyword of keywords) {
    const idx = lowerTranscript.indexOf(keyword);
    if (idx !== -1) {
      const start = Math.max(0, idx - 50);
      const end = Math.min(transcription.length, idx + keyword.length + 80);
      const snippet =
        (start > 0 ? "..." : "") +
        transcription.slice(start, end).trim() +
        (end < transcription.length ? "..." : "");
      const position = idx / transcription.length;
      const estimatedMinutes = Math.floor(position * 60);
      const timestamp = `${Math.floor(estimatedMinutes / 60)
        .toString()
        .padStart(2, "0")}:${(estimatedMinutes % 60)
        .toString()
        .padStart(2, "0")}`;
      return { snippet, timestamp };
    }
  }
  return null;
}

export function matchAllTranscriptQuotes(
  text: string,
  transcription: string | null
): { snippet: string; timestamp: string }[] {
  if (!transcription) return [];
  const keywords = text.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
  const lowerTranscript = transcription.toLowerCase();
  const results: { snippet: string; timestamp: string }[] = [];
  const usedPositions = new Set<number>();

  for (const keyword of keywords) {
    let searchFrom = 0;
    while (searchFrom < lowerTranscript.length) {
      const idx = lowerTranscript.indexOf(keyword, searchFrom);
      if (idx === -1) break;

      // Avoid overlapping snippets
      const bucket = Math.floor(idx / 150);
      if (usedPositions.has(bucket)) {
        searchFrom = idx + keyword.length;
        continue;
      }
      usedPositions.add(bucket);

      const start = Math.max(0, idx - 50);
      const end = Math.min(transcription.length, idx + keyword.length + 80);
      const snippet =
        (start > 0 ? "..." : "") +
        transcription.slice(start, end).trim() +
        (end < transcription.length ? "..." : "");
      const position = idx / transcription.length;
      const estimatedMinutes = Math.floor(position * 60);
      const timestamp = `${Math.floor(estimatedMinutes / 60)
        .toString()
        .padStart(2, "0")}:${(estimatedMinutes % 60)
        .toString()
        .padStart(2, "0")}`;
      results.push({ snippet, timestamp });
      searchFrom = idx + keyword.length;

      if (results.length >= 5) return results;
    }
  }
  return results;
}
