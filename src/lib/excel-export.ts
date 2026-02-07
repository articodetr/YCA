const COLORS = {
  headerBg: '1B5E20',
  headerFont: 'FFFFFF',
  stripeBg: 'F1F8E9',
  borderColor: 'C8E6C9',
  status: {
    submitted: { bg: 'FFF8E1', font: 'F57F17' },
    pending_payment: { bg: 'FFF8E1', font: 'F57F17' },
    in_progress: { bg: 'E3F2FD', font: '1565C0' },
    completed: { bg: 'E8F5E9', font: '2E7D32' },
    rejected: { bg: 'FFEBEE', font: 'C62828' },
    cancelled: { bg: 'FFEBEE', font: 'C62828' },
    no_show: { bg: 'ECEFF1', font: '546E7A' },
    incomplete: { bg: 'ECEFF1', font: '546E7A' },
  } as Record<string, { bg: string; font: string }>,
};

const thinBorder = {
  top: { style: 'thin', color: { argb: COLORS.borderColor } },
  bottom: { style: 'thin', color: { argb: COLORS.borderColor } },
  left: { style: 'thin', color: { argb: COLORS.borderColor } },
  right: { style: 'thin', color: { argb: COLORS.borderColor } },
};

export function styleHeaderRow(sheet: any) {
  const headerRow = sheet.getRow(1);
  headerRow.height = 28;
  headerRow.eachCell((cell: any) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: COLORS.headerBg },
    };
    cell.font = { bold: true, color: { argb: COLORS.headerFont }, size: 11 };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = thinBorder;
  });
}

export function styleDataRows(sheet: any, statusColIndex?: number, rawStatuses?: string[]) {
  const rowCount = sheet.rowCount;
  for (let i = 2; i <= rowCount; i++) {
    const row = sheet.getRow(i);
    const isStripe = i % 2 === 0;
    row.eachCell({ includeEmpty: true }, (cell: any) => {
      if (isStripe) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: COLORS.stripeBg },
        };
      }
      cell.border = thinBorder;
      cell.alignment = { vertical: 'top', wrapText: true };
      cell.font = { size: 10 };
    });

    if (statusColIndex && rawStatuses) {
      const statusCell = row.getCell(statusColIndex);
      const rawStatus = rawStatuses[i - 2];
      const colors = COLORS.status[rawStatus];
      if (colors) {
        statusCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: colors.bg },
        };
        statusCell.font = { bold: true, size: 10, color: { argb: colors.font } };
        statusCell.alignment = { vertical: 'middle', horizontal: 'center' };
      }
    }
  }
}

export function addSummaryHeader(
  sheet: any,
  lines: string[],
  colCount: number
) {
  for (let i = 0; i < lines.length; i++) {
    sheet.insertRow(1 + i, []);
  }
  sheet.insertRow(1 + lines.length, []);

  lines.forEach((text, idx) => {
    const row = sheet.getRow(idx + 1);
    sheet.mergeCells(idx + 1, 1, idx + 1, colCount);
    const cell = row.getCell(1);
    cell.value = text;
    cell.font = idx === 0
      ? { bold: true, size: 13, color: { argb: COLORS.headerBg } }
      : { size: 10, color: { argb: '616161' } };
    cell.alignment = { horizontal: 'left', vertical: 'middle' };
    row.height = idx === 0 ? 26 : 18;
  });

  const spacerRow = sheet.getRow(lines.length + 1);
  spacerRow.height = 6;
}

interface CaseNote {
  entity_id: string;
  note_text: string;
  note_type: string;
  created_at: string;
}

export function buildCaseNotesMap(caseNotes: CaseNote[]): Map<string, string> {
  const grouped = new Map<string, Map<string, string[]>>();

  for (const note of caseNotes) {
    if (!grouped.has(note.entity_id)) {
      grouped.set(note.entity_id, new Map());
    }
    const dateMap = grouped.get(note.entity_id)!;
    const dateStr = new Date(note.created_at).toLocaleDateString('en-GB');
    if (!dateMap.has(dateStr)) {
      dateMap.set(dateStr, []);
    }
    dateMap.get(dateStr)!.push(note.note_text);
  }

  const result = new Map<string, string>();
  for (const [entityId, dateMap] of grouped) {
    const parts: string[] = [];
    for (const [date, notes] of dateMap) {
      if (dateMap.size > 1) {
        parts.push(`${date}:`);
      }
      notes.forEach((n) => parts.push(`  - ${n}`));
    }
    result.set(entityId, parts.join('\n'));
  }

  return result;
}

export async function downloadWorkbook(workbook: any, filename: string) {
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function createWorkbook() {
  const ExcelJS = await import('exceljs');
  return new ExcelJS.default.Workbook();
}
