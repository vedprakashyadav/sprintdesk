interface Column<T> {
  header: string;
  accessor: (row: T) => React.ReactNode;
  key: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  getRowId: (row: T) => string | number;
  emptyMessage?: string;
}

export function DataTable<T>({ columns, data, getRowId, emptyMessage = 'No data available.' }: DataTableProps<T>) {
  if (data.length === 0) {
    return <p className="p-4 text-sm text-gray-500 dark:text-gray-400">{emptyMessage}</p>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
      <table className="w-full min-w-[480px] text-left text-sm">
        <thead className="bg-gray-50 dark:bg-gray-900">
          <tr>
            {columns.map((col) => (
              <th key={col.key} scope="col" className="px-4 py-2 font-medium text-gray-600 dark:text-gray-300">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {data.map((row) => (
            <tr key={getRowId(row)} className="hover:bg-gray-50 dark:hover:bg-gray-900">
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-2 text-gray-800 dark:text-gray-100">
                  {col.accessor(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
