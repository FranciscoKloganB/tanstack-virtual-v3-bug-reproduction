import * as React from 'react'
import { createRoot } from 'react-dom/client'

import { useVirtualizer } from '@tanstack/react-virtual'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  Row,
  useReactTable,
} from '@tanstack/react-table'
import { makeData, Person } from './makeData'
import './index.css'

function ReactTableVirtualized() {
  /* -------------------------------------------------------------------------- */
  /*                          generate mock data begin                          */
  /* -------------------------------------------------------------------------- */
  const columns = React.useMemo<ColumnDef<Person>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
        size: 60,
      },
      {
        accessorKey: 'firstName',
        cell: info => info.getValue(),
      },
      {
        accessorFn: row => row.lastName,
        id: 'lastName',
        cell: info => info.getValue(),
        header: () => <span>Last Name</span>,
      },
      {
        accessorKey: 'age',
        header: () => 'Age',
        size: 50,
      },
      {
        accessorKey: 'visits',
        header: () => <span>Visits</span>,
        size: 50,
      },
      {
        accessorKey: 'status',
        header: 'Status',
      },
      {
        accessorKey: 'progress',
        header: 'Profile Progress',
        size: 80,
      },
      {
        accessorKey: 'createdAt',
        header: 'Created At',
        cell: info => info.getValue<Date>().toLocaleString(),
      },
    ],
    []
  )

  // Work INCORRECTLY version (makeData(N), N = 1)
  // const [data] = React.useState(() => makeData(1))
  // Work correctly versions (makeData(N), N >= 2)
  // const [data] = React.useState(() => makeData(2))
  const [data] = React.useState(() => makeData(100))
  /* -------------------------------------------------------------------------- */
  /*                           generate mock data end                           */
  /* -------------------------------------------------------------------------- */

  /* -------------------------------------------------------------------------- */
  /*                         minimum reproduction begin                         */
  /* -------------------------------------------------------------------------- */
  const parentRef = React.useRef<HTMLDivElement>(null)

  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    debugTable: true,
  })

  const {rows} = table.getRowModel();

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 34,
    overscan: 20
  });

  return (
    <div ref={parentRef} className="container">
      <div style={{ height: `${virtualizer.getTotalSize()}px`}}>
        <table>
          <thead className="head">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => {
                  return (
                    <th
                      key={header.id}
                      colSpan={header.colSpan}
                      style={{ width: header.getSize() }}
                    >
                      {header.isPlaceholder ? null : (
                        <div>
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </div>
                      )}
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {virtualizer.getVirtualItems().map((virtualRow, index) => {
              const row = rows[virtualRow.index] as Row<Person>
              return (
                <tr key={row.id}
                style={{
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start - index * virtualRow.size}px)`,
                }}>
                  {row.getVisibleCells().map(cell => {
                    return (
                      <td key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
  /* -------------------------------------------------------------------------- */
  /*                          minimum reproduction end                          */
  /* -------------------------------------------------------------------------- */
}

function App() {
  return (
    <div>
      <ReactTableVirtualized />
    </div>
  )
}

const container = document.getElementById('root')
const root = createRoot(container!)
const { StrictMode } = React

root.render(
  <StrictMode>
    <App />
  </StrictMode>,
)
