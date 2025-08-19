

const Table = ({ columns, data, actions }) => {
  return (
    <table className="min-w-full bg-white rounded shadow overflow-hidden">
      <thead className="bg-blue-600 text-white">
        <tr>
          {columns.map((col) => (
            <th key={col} className="px-4 py-2 text-left">{col}</th>
          ))}
          {actions && <th className="px-4 py-2">Actions</th>}
        </tr>
      </thead>
      <tbody>
        {data.map((row, idx) => (
          <tr key={idx} className="border-b hover:bg-gray-100">
            {columns.map((col) => (
              <td key={col} className="px-4 py-2">{row[col]}</td>
            ))}
            {actions && (
              <td className="px-4 py-2 space-x-2">
                {actions(row)}
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Table;
