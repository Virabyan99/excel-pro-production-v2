"use client";

import { useState, useEffect } from 'react';
import { useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel, getGroupedRowModel, ColumnDef, ColumnFiltersState } from '@tanstack/react-table';
import { Row } from '../lib/types';
import { EditableCell } from './EditableCell';
import { isFormula, evaluateExpression } from '../utils/formula';
import { Input } from './ui/input';

const columns: ColumnDef<Row>[] = Array.from({ length: 5 }, (_, i) => {
  const letter = String.fromCharCode(65 + i); // A, B, C, D, E
  return {
    accessorKey: letter,
    header: letter,
    enableResizing: true,
    enableSorting: true,
    enableFiltering: true,
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
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [grouping, setGrouping] = useState<string[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  // Set isMounted to true after the component mounts
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    enableColumnResizing: true,
    columnResizeMode: 'onChange',
    state: { columnOrder, columnFilters, grouping },
    onColumnOrderChange: setColumnOrder,
    onColumnFiltersChange: setColumnFilters,
    onGroupingChange: setGrouping,
  });

  // Render nothing (or a loading state) until mounted
  if (!isMounted) {
    return null; // Optionally, return <div>Loading...</div>
  }

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

  function handleCellChange(rowIndex: number, columnId: string, value: string) {
    setData((prevData) => {
      const newData = [...prevData];
      newData[rowIndex] = { ...newData[rowIndex], [columnId]: value };
      return newData;
    });
  }

 function getDisplayValue(rawValue: string | undefined, data: Row[]): string {
  if (rawValue === undefined) {
    return ''; // Handle undefined values gracefully
  }
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
    <div>
      <select
        value={grouping[0] ?? ''}
        onChange={e => setGrouping(e.target.value ? [e.target.value] : [])}
        className="border rounded px-2 py-1 mb-2"
      >
        <option value="">No Grouping</option>
        {columns.map(col => (
          <option key={col.accessorKey} value={col.accessorKey as string}>
            {col.header as string}
          </option>
        ))}
      </select>

      <table className="min-w-full table-fixed border-collapse">
        <thead>
          <tr>
            {table.getHeaderGroups()[0].headers.map(header => (
              <th key={header.id}>
                {header.column.getCanFilter() ? (
                  <Input
                    placeholder="Filter..."
                    value={(header.column.getFilterValue() as string) ?? ''}
                    onChange={e => header.column.setFilterValue(e.target.value)}
                    className="w-full"
                  />
                ) : null}
              </th>
            ))}
          </tr>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, header.id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, header.id)}
                  style={{ width: header.getSize() }}
                  className="border px-2 py-1 text-left relative cursor-pointer select-none"
                  onClick={header.column.getToggleSortingHandler()}
                >
                  <div className="flex items-center space-x-1">
                    <span>{header.isPlaceholder ? null : header.column.columnDef.header}</span>
                    {{
                      asc: ' 🔼',
                      desc: ' 🔽',
                    }[header.column.getIsSorted() as string] || null}
                  </div>
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
    </div>
  );
}