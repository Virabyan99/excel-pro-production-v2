// components/Spreadsheet.tsx
"use client";

import { useState } from 'react';
import { useReactTable, getCoreRowModel, ColumnDef } from '@tanstack/react-table';
import { Row } from '../lib/types';
import { EditableCell } from './EditableCell';
import { isFormula, evaluateExpression } from '../utils/formula';

const columns: ColumnDef<Row>[] = Array.from({ length: 5 }, (_, i) => {
  const letter = String.fromCharCode(65 + i); // A, B, C, D, E
  return {
    accessorKey: letter,
    header: letter,
  };
});

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

  function getDisplayValue(rawValue: string, data: Row[]): string {
    if (isFormula(rawValue)) {
      try {
        const result = evaluateExpression(rawValue, data);
        return isNaN(result) ? 'Error' : String(result);
      } catch (err) {
        console.error(err);
        return 'Error';
      }
    }
    return rawValue;
  }

  return (
    <table className="min-w-full table-fixed border-collapse">
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th key={header.id} className="border px-2 py-1 text-left w-24">
                {header.isPlaceholder ? null : header.column.columnDef.header}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map((row) => (
          <tr key={row.id}>
            {row.getVisibleCells().map((cell) => {
              const rawValue = cell.getValue() as string;
              const displayValue = getDisplayValue(rawValue, data);
              return (
                <td key={cell.id} className="border px-2 py-1 w-24 h-8 overflow-hidden">
                  <EditableCell
                    rawValue={rawValue}
                    displayValue={displayValue}
                    onChange={(value) => handleCellChange(row.index, cell.column.id, value)}
                  />
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}