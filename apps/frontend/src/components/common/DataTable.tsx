import type { ReactNode } from "react";

export interface DataTableColumn<TRow> {
  key?: string;
  label?: ReactNode;
  render?: (row: TRow, rowIndex: number) => ReactNode;
}

export interface DataTableProps<TRow> {
  headers?: Array<DataTableColumn<TRow> | string>;
  rows?: TRow[];
  getRowKey?: (row: TRow, rowIndex: number) => string | number;
  emptyMessage?: ReactNode;
}

function renderCell<TRow>(
  header: DataTableColumn<TRow> | string,
  row: TRow,
  rowIndex: number,
  columnIndex: number
): ReactNode {
  if (typeof header === "string") {
    if (Array.isArray(row)) return row[columnIndex];
    return null;
  }

  if (typeof header.render === "function") {
    return header.render(row, rowIndex);
  }

  if (Array.isArray(row)) return row[columnIndex];

  const key = header.key;
  if (key) return (row as Record<string, unknown>)[key] as ReactNode;
  return null;
}

function headerLabel<TRow>(header: DataTableColumn<TRow> | string): ReactNode {
  if (typeof header === "string") return header;
  return header.label ?? header.key ?? "";
}

function headerKey<TRow>(header: DataTableColumn<TRow> | string, index: number): string {
  if (typeof header === "string") return String(index);
  return header.key ?? String(index);
}

export default function DataTable<TRow>({
  headers = [],
  rows = [],
  getRowKey,
  emptyMessage = "No hay información disponible.",
}: DataTableProps<TRow>) {
  if (!rows.length) {
    return (
      <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center text-sm text-slate-600 dark:text-slate-400">
        {emptyMessage}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4 md:hidden">
        {rows.map((row, rowIndex) => (
          <div
            key={getRowKey ? getRowKey(row, rowIndex) : rowIndex}
            className="space-y-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4"
          >
            {headers.map((header, columnIndex) => (
              <div
                key={headerKey(header, columnIndex)}
                className="flex items-start justify-between gap-4"
              >
                <span className="text-xs font-semibold uppercase text-slate-600 dark:text-slate-400">
                  {headerLabel(header)}
                </span>
                <span className="text-right text-sm text-slate-900 dark:text-slate-100">
                  {renderCell(header, row, rowIndex, columnIndex)}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 md:block">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
              {headers.map((header, index) => (
                <th
                  key={headerKey(header, index)}
                  className="px-6 py-4 text-xs font-bold uppercase text-slate-600 dark:text-slate-400"
                >
                  {headerLabel(header)}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {rows.map((row, rowIndex) => (
              <tr
                key={getRowKey ? getRowKey(row, rowIndex) : rowIndex}
                className="transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {headers.map((header, columnIndex) => (
                  <td key={headerKey(header, columnIndex)} className="px-6 py-4 text-sm text-slate-900 dark:text-slate-100">
                    {renderCell(header, row, rowIndex, columnIndex)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
