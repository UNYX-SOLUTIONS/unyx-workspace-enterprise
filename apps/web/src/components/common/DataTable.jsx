export default function DataTable({
  headers = [],
  rows = [],
  getRowKey,
  emptyMessage = "No hay información disponible.",
}) {
  if (!rows.length) {
    return (
      <div className="rounded-lg border border-[#c7c6cb] bg-white p-8 text-center text-sm text-[#46464b]">
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
            className="space-y-3 rounded-lg border border-[#c7c6cb] bg-white p-4"
          >
            {headers.map((header, columnIndex) => (
              <div
                key={header.key ?? columnIndex}
                className="flex items-start justify-between gap-4"
              >
                <span className="text-xs font-semibold uppercase text-[#46464b]">
                  {header.label ?? header}
                </span>

                <span className="text-right text-sm text-[#010105]">
                  {typeof header.render === "function"
                    ? header.render(row, rowIndex)
                    : Array.isArray(row)
                      ? row[columnIndex]
                      : row[header.key]}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-lg border border-[#c7c6cb] bg-white md:block">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-[#c7c6cb] bg-[#eff4ff]">
              {headers.map((header, index) => (
                <th
                  key={header.key ?? index}
                  className="px-6 py-4 text-xs font-bold uppercase text-[#46464b]"
                >
                  {header.label ?? header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-[#c7c6cb]">
            {rows.map((row, rowIndex) => (
              <tr
                key={getRowKey ? getRowKey(row, rowIndex) : rowIndex}
                className="transition-colors hover:bg-[#eff4ff]"
              >
                {headers.map((header, columnIndex) => (
                  <td
                    key={header.key ?? columnIndex}
                    className="px-6 py-4 text-sm text-[#010105]"
                  >
                    {typeof header.render === "function"
                      ? header.render(row, rowIndex)
                      : Array.isArray(row)
                        ? row[columnIndex]
                        : row[header.key]}
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
