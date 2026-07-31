// TICKET-ADV114 — Compound <DataTable> with Header / Body / Pagination subcomponents.

import React, {
  createContext,
  useContext,
  useMemo,
  useState,
} from 'react';
const DataTableContext = createContext(null);
function useDataTable() {
  const context = useContext(DataTableContext);
  if (!context) {
    throw new Error('useDataTable must be used inside <DataTable>');
  }
  return context;
}
export default function DataTable({
  children,
  data = [],
  pageSize = 10,
}) {
  const [sort, setSort] = useState({
    key: null,
    direction: 'asc',
  });

  const [page, setPage] = useState(0);

  const sortedData = useMemo(() => {
    if (!sort.key) {
      return [...data];
    }
    return [...data].sort((a, b) => {
      const first = a[sort.key];
      const second = b[sort.key];
      if (first < second) {
        return sort.direction === 'asc' ? -1 : 1;
      }
      if (first > second) {
        return sort.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [data, sort]);

  const totalPages = Math.max(
    1,
    Math.ceil(sortedData.length / pageSize)
  );

  const paginatedData = useMemo(() => {
    const start = page * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, page, pageSize]);

  const handleSortChange = (key) => {
    setPage(0);

    setSort((previous) => {
      if (previous.key === key) {
        return {
          key,
          direction:
            previous.direction === 'asc'
              ? 'desc'
              : 'asc',
        };
      }

      return {
        key,
        direction: 'asc',
      };
    });
  };// TICKET-ADV114 — Compound <DataTable> with Header / Body / Pagination subcomponents.
import React, { createContext, useContext, useMemo, useState, } from 'react';

const DataTableContext = createContext({ sort: null, page: 0, size: 20 });

export default function DataTable({ children, sort, page = 0, size = 20, onSortChange }) {
  // TODO(TICKET-ADV114): wrap `children` in DataTableContext.Provider so the
  //                     Header / Body / Pagination subcomponents can read
  //                     sort/page/size/onSortChange without prop drilling.
  return (
    <DataTableContext.Provider value={{ sort, page, size, onSortChange }}>
      <div className="data-table">{children}</div>
    </DataTableContext.Provider>
  );
}

DataTable.Header = function Header({ columns }) {
  // TODO(TICKET-ADV114): pull `sort` + `onSortChange` from DataTableContext and
  //                     render a clickable <button> per column. Active column
  //                     should get a different className.
  return (
    <div className="data-table__header" role="row">
      {/* TODO(TICKET-ADV114): map columns -> <button>{c.label}</button> */}
    </div>
  );
};

DataTable.Body = function Body({ rows, render }) {
  // TODO(TICKET-ADV114): iterate `rows` and call `render(row)` for each,
  //                     wrapping in a div.data-table__row with a stable key.
  return (
    <div className="data-table__body">
      {/* TODO(TICKET-ADV114): rows.map(...) */}
    </div>
  );
};
  const value = {
    rows: paginatedData,
    sort,
    page,
    pageSize,
    totalPages,
    setPage,
    handleSortChange,
  };

  return (
    <DataTableContext.Provider value={value}>
      <div className="data-table">
        {children}
      </div>
    </DataTableContext.Provider>
  );
}

DataTable.Header = function Header({ columns = [] }) {
  const { sort, handleSortChange } = useDataTable();

  return (
    <div className="data-table__header" role="row">
      {columns.map((column) => (
        <button
          key={column.key}
          type="button"
          onClick={() => handleSortChange(column.key)}
          className={
            sort.key === column.key
              ? 'active'
              : ''
          }
          aria-sort={
            sort.key === column.key
              ? sort.direction === 'asc'
                ? 'ascending'
                : 'descending'
              : 'none'
          }
        >
          {column.label}

          {sort.key === column.key &&
            (sort.direction === 'asc'
              ? ' ▲'
              : ' ▼')}
        </button>
      ))}
    </div>
  );
};

DataTable.Body = function Body({ render }) {
  const { rows } = useDataTable();

  return (
    <div className="data-table__body">
      {rows.map((row) => (
        <div
          key={row.id}
          className="data-table__row"
          role="row"
        >
          {render(row)}
        </div>
      ))}
    </div>
  );
};

DataTable.Pagination = function Pagination() {
  const {
    page,
    totalPages,
    setPage,
  } = useDataTable();

  return (
    <nav
      className="data-table__pagination"
      aria-label="Pagination"
    >
      <button
        type="button"
        disabled={page === 0}
        onClick={() => setPage((p) => p - 1)}
      >
        ‹ Prev
      </button>

      <span>
        {page + 1} / {totalPages}
      </span>

      <button
        type="button"
        disabled={page >= totalPages - 1}
        onClick={() => setPage((p) => p + 1)}
      >
        Next ›
      </button>
    </nav>
  );
};
