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
    enableResizing: true, // Enable resizing
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
  const [columnOrder, setColumnOrder] = useState<string[]>(columns.map(c => c.accessorKey as string));

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    enableColumnResizing: true, // Enable resizing
    columnResizeMode: 'onChange', // Resize mode
    enableColumnOrdering: true, // Enable ordering
    state: { columnOrder }, // Manage column order
    onColumnOrderChange: setColumnOrder, // Update order state
  });

  // Drag-and-drop handlers
  function handleDragStart(e: React.DragEvent, headerId: string) {
    e.dataTransfer.setData('headerId', headerId);
  }

  function handleDrop(e: React.DragEvent, headerId: string) {
    const from = e.dataTransfer.getData('headerId');
    const newOrder = [...columnOrder];
    const fromIdx = newOrder.indexOf(from);
    const toIdx = newOrder.indexOf(headerId);
    newOrder.splice(fromIdx, 1);
    newOrder.splice(toIdx, 0, from);
    setColumnOrder(newOrder);
  }

  // Handle cell edits
  function handleCellChange(rowIndex: number, columnId: string, value: string) {
    setData((prevData) => {
      const newData = [...prevData];
      newData[rowIndex] = { ...newData[rowIndex], [columnId]: value };
      return newData;
    });
  }

  // Evaluate formulas
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
              <th
                key={header.id}
                draggable
                onDragStart={(e) => handleDragStart(e, header.id)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, header.id)}
                style={{ width: header.getSize() }} // Dynamic width
                className="border px-2 py-1 text-left relative"
              >
                {header.isPlaceholder ? null : header.column.columnDef.header}
                <div
                  {...{
                    onMouseDown: header.getResizeHandler(),
                    onTouchStart: header.getResizeHandler(),
                  }}
                  className="absolute right-0 top-0 h-full w-1 cursor-col-resize bg-transparent hover:bg-gray-200"
                />
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