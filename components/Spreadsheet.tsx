// components/Spreadsheet.tsx
"use client";

import { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  ColumnDef,
} from '@tanstack/react-table';
import { Row } from '../lib/types';
import { EditableCell } from './EditableCell';

const columns: ColumnDef<Row>[] = Array.from({ length: 5 }, (_, i) => ({
  accessorKey: `col${i + 1}`,
  header: `Col ${i + 1}`,
}));

const initialData: Row[] = Array.from({ length: 5 }).map(() => {
  const row: Row = {};
  columns.forEach((col) => {
    row[col.accessorKey as string] = '';
  });
  return row;
});

export function Spreadsheet() {
  const [data, setData] = useState(initialData);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  function handleCellChange(rowIndex: number, columnId: string, value: string) {
    setData((prevData) => {
      const newData = [...prevData];
      newData[rowIndex] = { ...newData[rowIndex], [columnId]: value };
      return newData;
    });
  }

  return (
    <table className="min-w-full table-auto border-collapse">
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th key={header.id} className="border px-2 py-1 text-left">
                {header.isPlaceholder ? null : header.column.columnDef.header}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map((row) => (
          <tr key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <td key={cell.id} className="border px-2 py-1">
                <EditableCell
                  value={cell.getValue() as string | number}
                  onChange={(value) => handleCellChange(row.index, cell.column.id, value)}
                />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}