export default function DataTable({ columns, data, onRowClick, emptyMessage = 'Sin registros' }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-surface-container-lowest rounded-xl p-16 text-center border border-outline-variant/10">
        <span className="material-symbols-outlined text-4xl text-outline-variant mb-4 block">
          inbox
        </span>
        <p className="text-on-surface-variant font-medium">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/10 shadow-card">
      <table className="w-full text-left border-separate border-spacing-0">
        <thead>
          <tr className="bg-surface-container-low/50">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-8 py-5 text-[10px] font-black text-on-surface-variant uppercase tracking-widest border-b border-outline-variant/10 ${col.align === 'right' ? 'text-right' : ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr
              key={row.id ?? i}
              className={`group transition-colors hover:bg-surface-container-low/30 ${i % 2 === 1 ? 'bg-surface-container-low/10' : ''} ${onRowClick ? 'cursor-pointer' : ''}`}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`px-8 py-5 ${col.align === 'right' ? 'text-right' : ''}`}
                >
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
