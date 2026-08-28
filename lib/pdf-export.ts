export type PdfMetric = { label: string; value: string };
export type PdfSection = { title: string; rows: string[] };

export type MovendoPdfInput = {
  title: string;
  subtitle: string;
  filename: string;
  metrics: PdfMetric[];
  sections: PdfSection[];
};

const pageWidth = 595;
const pageHeight = 842;

function sanitized(value: string) {
  return value
    .replaceAll("–", "-")
    .replaceAll("—", "-")
    .replaceAll("·", "-")
    .replace(/[^\x20-\x7EĄĆĘŁŃÓŚŹŻąćęłńóśźż]/g, "");
}

const polishPdfCodes: Record<string, string> = {
  Ą: String.fromCharCode(128), Ć: String.fromCharCode(129), Ę: String.fromCharCode(130), Ł: String.fromCharCode(131), Ń: String.fromCharCode(132),
  Ó: String.fromCharCode(133), Ś: String.fromCharCode(134), Ź: String.fromCharCode(135), Ż: String.fromCharCode(136), ą: String.fromCharCode(137),
  ć: String.fromCharCode(138), ę: String.fromCharCode(139), ł: String.fromCharCode(140), ń: String.fromCharCode(141), ó: String.fromCharCode(142),
  ś: String.fromCharCode(143), ź: String.fromCharCode(144), ż: String.fromCharCode(145),
};

function encodePolish(value: string) {
  return Array.from(sanitized(value), (character) => polishPdfCodes[character] ?? character).join("");
}

function pdfText(value: string) {
  return encodePolish(value).replaceAll("\\", "\\\\").replaceAll("(", "\\(").replaceAll(")", "\\)");
}

function wrap(value: string, max = 76) {
  const words = sanitized(value).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length > max && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [""];
}

function createPageBuilder(title: string, subtitle: string, pageNumber: number) {
  const commands: string[] = [
    "0 0 0 rg 0 748 595 94 re f",
    `BT /F2 20 Tf 1 1 1 rg 42 795 Td (${pdfText(title)}) Tj ET`,
    `BT /F1 9 Tf .72 .72 .72 rg 42 773 Td (${pdfText(subtitle)}) Tj ET`,
    `BT /F1 8 Tf .45 .45 .45 rg 42 26 Td (FUTUREBODY TRAINER  |  strona ${pageNumber}) Tj ET`,
  ];
  return { commands, y: 718 };
}

function buildContentPages(input: MovendoPdfInput) {
  const pages: string[][] = [];
  let pageNumber = 1;
  let page = createPageBuilder(input.title, input.subtitle, pageNumber);

  function nextPage() {
    pages.push(page.commands);
    pageNumber += 1;
    page = createPageBuilder(input.title, input.subtitle, pageNumber);
  }

  function ensureSpace(height: number) {
    if (page.y - height < 55) nextPage();
  }

  if (input.metrics.length) {
    ensureSpace(88);
    const width = 119;
    input.metrics.slice(0, 4).forEach((metric, index) => {
      const x = 42 + index * 128;
      page.commands.push(`.96 .96 .95 rg ${x} ${page.y - 62} ${width} 62 re f`);
      page.commands.push(`BT /F1 7 Tf .42 .42 .42 rg ${x + 10} ${page.y - 18} Td (${pdfText(metric.label.toUpperCase())}) Tj ET`);
      page.commands.push(`BT /F2 17 Tf 0 0 0 rg ${x + 10} ${page.y - 45} Td (${pdfText(metric.value)}) Tj ET`);
    });
    page.y -= 88;
  }

  for (const section of input.sections) {
    ensureSpace(62);
    page.commands.push(`BT /F2 13 Tf 0 0 0 rg 42 ${page.y} Td (${pdfText(section.title)}) Tj ET`);
    page.y -= 17;
    page.commands.push(`.12 .12 .12 RG 42 ${page.y} m 553 ${page.y} l S`);
    page.y -= 18;

    for (const row of section.rows) {
      const lines = wrap(row);
      ensureSpace(lines.length * 13 + 13);
      page.commands.push(`.97 .97 .96 rg 42 ${page.y - lines.length * 13 - 4} 511 ${lines.length * 13 + 10} re f`);
      lines.forEach((line, index) => page.commands.push(`BT /F1 9 Tf .18 .18 .18 rg 53 ${page.y - 12 - index * 13} Td (${pdfText(line)}) Tj ET`));
      page.y -= lines.length * 13 + 16;
    }
    page.y -= 12;
  }

  pages.push(page.commands);
  return pages;
}

export function buildMovendoPdf(input: MovendoPdfInput) {
  const contentPages = buildContentPages(input);
  const objects: string[] = [];
  const pageObjectIds = contentPages.map((_, index) => 5 + index * 2);
  objects[0] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[1] = `<< /Type /Pages /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${contentPages.length} >>`;
  const centralEuropeanEncoding = "/Encoding << /Type /Encoding /BaseEncoding /WinAnsiEncoding /Differences [128 /Aogonek /Cacute /Eogonek /Lslash /Nacute /Oacute /Sacute /Zacute /Zdotaccent /aogonek /cacute /eogonek /lslash /nacute /oacute /sacute /zacute /zdotaccent] >>";
  objects[2] = `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica ${centralEuropeanEncoding} >>`;
  objects[3] = `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold ${centralEuropeanEncoding} >>`;

  contentPages.forEach((commands, index) => {
    const pageId = 5 + index * 2;
    const contentId = pageId + 1;
    const stream = commands.join("\n");
    objects[pageId - 1] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentId} 0 R >>`;
    objects[contentId - 1] = `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`;
  });

  let pdf = "%PDF-1.4\n%FUTUREBODY\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => { pdf += `${String(offset).padStart(10, "0")} 00000 n \n`; });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return Uint8Array.from(pdf, (character) => character.charCodeAt(0) & 0xff);
}

export function downloadMovendoPdf(input: MovendoPdfInput) {
  const bytes = buildMovendoPdf(input);
  const blob = new Blob([bytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = input.filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
