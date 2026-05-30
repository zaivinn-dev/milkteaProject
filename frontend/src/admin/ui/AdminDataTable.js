import React from 'react';

export default function AdminDataTable({ columns, children, emptyMessage, isEmpty }) {
  return (
    <div className="admin-table-wrap">
      <div className="overflow-x-auto">
        <table className="admin-table w-full">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col} className="admin-table-th">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {isEmpty ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-sm text-tea-muted">
                  {emptyMessage || 'No data yet'}
                </td>
              </tr>
            ) : (
              children
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
