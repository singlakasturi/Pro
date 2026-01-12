// src/utils/parseCSV.js
export function parseCSV(text) {
    // Very small CSV parser assuming no embedded newlines in fields and comma separator.
    // Trims header, returns array of objects.
    const lines = text.trim().split(/\r?\n/).filter(Boolean);
    if (lines.length === 0) return [];
    const headers = lines[0].split(",").map((h) => h.trim());
    const rows = lines.slice(1).map((line) => {
      // split only on commas (no quotes handling required for our dummy data)
      const values = line.split(",").map((v) => v.trim());
      const obj = {};
      headers.forEach((h, i) => {
        obj[h] = values[i] === undefined ? "" : values[i];
      });
      return obj;
    });
    return rows;
  }
  