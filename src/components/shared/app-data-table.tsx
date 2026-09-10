"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { ReactNode } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import { LiquidGlass } from "@/components/shared/liquid-glass";
import { Button } from "@/components/ui/button";
import { CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface AppDataTableProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
  pageIndex: number;
  pageSize: number;
  pageCount: number;
  totalRows: number;
  sorting?: SortingState;
  toolbar?: ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  onPageChange: (pageIndex: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSortingChange?: (sorting: SortingState) => void;
}

export function AppDataTable<TData>({
  columns,
  data,
  pageIndex,
  pageSize,
  pageCount,
  totalRows,
  sorting = [],
  toolbar,
  emptyTitle = "No results",
  emptyDescription = "Try changing your search or filters.",
  onPageChange,
  onPageSizeChange,
  onSortingChange,
}: AppDataTableProps<TData>) {
  // TanStack Table v8 intentionally exposes callback-rich state that React
  // Compiler does not memoize; the table remains safe as a client boundary.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    pageCount,
    state: { pagination: { pageIndex, pageSize }, sorting },
    onSortingChange: (updater) => {
      const next = typeof updater === "function" ? updater(sorting) : updater;
      onSortingChange?.(next);
    },
  });

  return (
    <LiquidGlass
      kind="inspector"
      renderKey={`${pageIndex}-${pageSize}-${totalRows}`}
      className="overflow-hidden rounded-[1.25rem] border border-white/85 bg-background/25 shadow-[0_14px_38px_rgba(55,39,31,0.07)]"
      role="region"
      aria-label="Data table"
    >
      {toolbar ? (
        <CardHeader className="border-b border-foreground/10 bg-background/62 px-4 py-4 sm:px-4 sm:pt-4">
          {toolbar}
        </CardHeader>
      ) : null}

      <CardContent className="bg-card/68 px-0 pb-0 sm:px-0 sm:pb-0">
        {data.length === 0 ? (
          <div className="px-6 py-8">
            <EmptyState title={emptyTitle} description={emptyDescription} />
          </div>
        ) : (
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent">
                  {headerGroup.headers.map((header) => {
                    const sorted = header.column.getIsSorted();
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder ? null : header.column.getCanSort() ? (
                          <button
                            type="button"
                            className="inline-flex items-center gap-1.5 hover:text-foreground"
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                            {sorted === "asc" ? (
                              <ArrowUp className="size-3.5" />
                            ) : sorted === "desc" ? (
                              <ArrowDown className="size-3.5" />
                            ) : (
                              <ArrowUpDown className="size-3.5 opacity-50" />
                            )}
                          </button>
                        ) : (
                          flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )
                        )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <CardFooter className="flex-col gap-3 border-t border-foreground/10 bg-background/62 px-4 py-3 font-mono text-[0.62rem] text-muted-foreground sm:flex-row sm:justify-between sm:px-4 sm:pb-3">
        <p>
          {totalRows === 0
            ? "0 records"
            : `${pageIndex * pageSize + 1}–${Math.min(
                (pageIndex + 1) * pageSize,
                totalRows,
              )} of ${totalRows}`}
        </p>
        <div className="flex items-center gap-2">
          <span className="hidden tracking-[0.05em] uppercase sm:inline">
            Rows
          </span>
          <Select
            aria-label="Rows per page"
            className="h-7 w-16 font-mono text-[0.62rem]"
            value={String(pageSize)}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
          >
            {[10, 20, 50].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </Select>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Previous page"
            disabled={pageIndex <= 0}
            onClick={() => onPageChange(pageIndex - 1)}
          >
            <ChevronLeft />
          </Button>
          <span className="min-w-20 text-center">
            Page {pageCount === 0 ? 0 : pageIndex + 1} of {pageCount}
          </span>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Next page"
            disabled={pageIndex + 1 >= pageCount}
            onClick={() => onPageChange(pageIndex + 1)}
          >
            <ChevronRight />
          </Button>
        </div>
      </CardFooter>
    </LiquidGlass>
  );
}
