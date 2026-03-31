"use client";

import {
  Box,
  Button,
  Checkbox,
  createListCollection,
  HStack,
  Icon,
  Popover,
  Portal,
  Select,
  Skeleton,
  Table,
  Text,
  VStack,
} from "@chakra-ui/react";
import {
  LuChevronUp,
  LuChevronDown,
  LuChevronsUpDown,
  LuSettings2,
  LuChevronLeft,
  LuChevronRight,
} from "react-icons/lu";

export type SortDir = "asc" | "desc";

export interface SortState {
  field: string;
  dir: SortDir;
}

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  width?: string;
  sortField?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  keyExtractor: (row: T) => string | number;
  page?: number;
  totalItems?: number;
  itemsPerPage?: number;
  onPageChange?: (page: number) => void;
  emptyMessage?: string;
  sort?: SortState;
  onSortChange?: (sort: SortState) => void;
  // Row selection
  selectable?: boolean;
  selectedKeys?: Set<string | number>;
  onSelectionChange?: (keys: Set<string | number>) => void;
  bulkActions?: (selectedCount: number) => React.ReactNode;
  // Configurable pagination
  pageSizeOptions?: number[];
  onItemsPerPageChange?: (size: number) => void;
  // Column visibility
  hiddenColumns?: Set<string>;
  onHiddenColumnsChange?: (keys: Set<string>) => void;
  // Loading skeleton rows
  loadingRows?: number;
}

export function DataTable<T>({
  columns,
  data,
  isLoading,
  keyExtractor,
  page = 1,
  totalItems = 0,
  itemsPerPage = 30,
  onPageChange,
  emptyMessage = "Aucun résultat",
  sort,
  onSortChange,
  selectable,
  selectedKeys,
  onSelectionChange,
  bulkActions,
  pageSizeOptions,
  onItemsPerPageChange,
  hiddenColumns,
  onHiddenColumnsChange,
  loadingRows = 5,
}: DataTableProps<T>) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const visibleColumns = hiddenColumns
    ? columns.filter((c) => !hiddenColumns.has(c.key))
    : columns;

  const allSelected =
    selectable && data.length > 0 && selectedKeys?.size === data.length;
  const someSelected =
    selectable &&
    selectedKeys &&
    selectedKeys.size > 0 &&
    selectedKeys.size < data.length;

  const handleSelectAll = () => {
    if (!onSelectionChange) return;
    if (allSelected) {
      onSelectionChange(new Set());
    } else {
      onSelectionChange(new Set(data.map((row) => keyExtractor(row))));
    }
  };

  const handleSelectRow = (key: string | number) => {
    if (!onSelectionChange || !selectedKeys) return;
    const next = new Set(selectedKeys);
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }
    onSelectionChange(next);
  };

  const handleHeaderClick = (col: Column<T>) => {
    if (!col.sortField || !onSortChange) return;
    if (sort?.field === col.sortField) {
      onSortChange({
        field: col.sortField,
        dir: sort.dir === "asc" ? "desc" : "asc",
      });
    } else {
      onSortChange({ field: col.sortField, dir: "asc" });
    }
  };

  const totalColSpan = visibleColumns.length + (selectable ? 1 : 0);

  const pageSizeCollection = pageSizeOptions
    ? createListCollection({
        items: pageSizeOptions.map((s) => ({
          label: `${s} / page`,
          value: String(s),
        })),
      })
    : null;

  return (
    <Box>
      {/* Toolbar: bulk actions + column visibility */}
      {(bulkActions || onHiddenColumnsChange) && (
        <HStack justify="space-between" mb="3" flexWrap="wrap" gap="2">
          <Box>
            {bulkActions &&
              selectedKeys &&
              selectedKeys.size > 0 &&
              bulkActions(selectedKeys.size)}
          </Box>
          <HStack gap="2">
            {onHiddenColumnsChange && (
              <Popover.Root>
                <Popover.Trigger asChild>
                  <Button size="sm" variant="outline">
                    <LuSettings2 />
                    Colonnes
                  </Button>
                </Popover.Trigger>
                <Portal>
                  <Popover.Positioner>
                    <Popover.Content>
                      <Popover.Body>
                        <VStack align="start" gap="2">
                          {columns.map((col) => (
                            <Checkbox.Root
                              key={col.key}
                              size="sm"
                              checked={!hiddenColumns?.has(col.key)}
                              onCheckedChange={(e) => {
                                const next = new Set(hiddenColumns);
                                if (e.checked) {
                                  next.delete(col.key);
                                } else {
                                  next.add(col.key);
                                }
                                onHiddenColumnsChange(next);
                              }}
                            >
                              <Checkbox.HiddenInput />
                              <Checkbox.Control>
                                <Checkbox.Indicator />
                              </Checkbox.Control>
                              <Checkbox.Label>{col.header}</Checkbox.Label>
                            </Checkbox.Root>
                          ))}
                        </VStack>
                      </Popover.Body>
                    </Popover.Content>
                  </Popover.Positioner>
                </Portal>
              </Popover.Root>
            )}
          </HStack>
        </HStack>
      )}

      {/* Table */}
      <Box
        overflowX="auto"
        rounded="lg"
        borderWidth="1px"
        borderColor="card.border"
        bg="card.bg"
      >
        <Table.Root variant="outline" size="sm">
          <Table.Header>
            <Table.Row bg="bg.subtle">
              {selectable && (
                <Table.ColumnHeader px="3" py="3" w="40px">
                  <Checkbox.Root
                    size="sm"
                    checked={someSelected ? "indeterminate" : allSelected}
                    onCheckedChange={handleSelectAll}
                  >
                    <Checkbox.HiddenInput />
                    <Checkbox.Control>
                      <Checkbox.Indicator />
                    </Checkbox.Control>
                  </Checkbox.Root>
                </Table.ColumnHeader>
              )}
              {visibleColumns.map((col) => {
                const isSorted = sort?.field === col.sortField;
                const isSortable = !!col.sortField && !!onSortChange;
                return (
                  <Table.ColumnHeader
                    key={col.key}
                    px="4"
                    py="3"
                    fontWeight="semibold"
                    fontSize="xs"
                    textTransform="uppercase"
                    letterSpacing="wider"
                    color={isSorted ? "primary.fg" : "fg.muted"}
                    w={col.width}
                    cursor={isSortable ? "pointer" : "default"}
                    userSelect="none"
                    onClick={() => handleHeaderClick(col)}
                    _hover={isSortable ? { color: "fg" } : undefined}
                  >
                    <HStack gap="1" display="inline-flex">
                      <span>{col.header}</span>
                      {isSortable && (
                        <Icon
                          as={
                            isSorted
                              ? sort!.dir === "asc"
                                ? LuChevronUp
                                : LuChevronDown
                              : LuChevronsUpDown
                          }
                          boxSize="3"
                          opacity={isSorted ? 1 : 0.4}
                        />
                      )}
                    </HStack>
                  </Table.ColumnHeader>
                );
              })}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {isLoading ? (
              Array.from({ length: loadingRows }).map((_, i) => (
                <Table.Row key={`skeleton-${i}`}>
                  {selectable && (
                    <Table.Cell px="3" py="3">
                      <Skeleton height="4" width="4" />
                    </Table.Cell>
                  )}
                  {visibleColumns.map((col) => (
                    <Table.Cell key={col.key} px="4" py="3">
                      <Skeleton
                        height="4"
                        width={
                          col.width ??
                          `${60 + ((i * 17 + col.key.length * 13) % 40)}%`
                        }
                      />
                    </Table.Cell>
                  ))}
                </Table.Row>
              ))
            ) : data.length === 0 ? (
              <Table.Row>
                <Table.Cell colSpan={totalColSpan} textAlign="center" py="8">
                  <Text color="fg.muted" fontSize="sm">
                    {emptyMessage}
                  </Text>
                </Table.Cell>
              </Table.Row>
            ) : (
              data.map((row) => {
                const key = keyExtractor(row);
                const isSelected = selectedKeys?.has(key);
                return (
                  <Table.Row
                    key={key}
                    _hover={{ bg: "bg.subtle" }}
                    transition="background 0.1s"
                    bg={isSelected ? "primary.muted" : undefined}
                  >
                    {selectable && (
                      <Table.Cell px="3" py="3">
                        <Checkbox.Root
                          size="sm"
                          checked={isSelected ?? false}
                          onCheckedChange={() => handleSelectRow(key)}
                        >
                          <Checkbox.HiddenInput />
                          <Checkbox.Control>
                            <Checkbox.Indicator />
                          </Checkbox.Control>
                        </Checkbox.Root>
                      </Table.Cell>
                    )}
                    {visibleColumns.map((col) => (
                      <Table.Cell key={col.key} px="4" py="3" fontSize="sm">
                        {col.render(row)}
                      </Table.Cell>
                    ))}
                  </Table.Row>
                );
              })
            )}
          </Table.Body>
        </Table.Root>
      </Box>

      {/* Pagination footer */}
      {(onPageChange || pageSizeCollection) && (
        <HStack justify="space-between" mt="4" px="1" flexWrap="wrap" gap="2">
          <HStack gap="3">
            <Text fontSize="sm" color="fg.muted">
              {totalItems} résultat{totalItems !== 1 ? "s" : ""}
            </Text>
            {selectable && selectedKeys && selectedKeys.size > 0 && (
              <Text fontSize="sm" color="primary.fg" fontWeight="medium">
                {selectedKeys.size} sélectionné
                {selectedKeys.size !== 1 ? "s" : ""}
              </Text>
            )}
          </HStack>

          <HStack gap="3">
            {pageSizeCollection && onItemsPerPageChange && (
              <Select.Root
                size="sm"
                collection={pageSizeCollection}
                value={[String(itemsPerPage)]}
                onValueChange={({ value }) =>
                  onItemsPerPageChange(Number(value[0]))
                }
                width="130px"
              >
                <Select.Trigger>
                  <Select.ValueText />
                </Select.Trigger>
                <Portal>
                  <Select.Positioner>
                    <Select.Content>
                      {pageSizeCollection.items.map((item) => (
                        <Select.Item key={item.value} item={item}>
                          {item.label}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Positioner>
                </Portal>
              </Select.Root>
            )}

            {onPageChange && totalPages > 1 && (
              <HStack gap="2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => onPageChange(page - 1)}
                >
                  <LuChevronLeft />
                </Button>
                <Text
                  fontSize="sm"
                  color="fg.muted"
                  fontVariantNumeric="tabular-nums"
                  minW="80px"
                  textAlign="center"
                >
                  {page} / {totalPages}
                </Text>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page >= totalPages}
                  onClick={() => onPageChange(page + 1)}
                >
                  <LuChevronRight />
                </Button>
              </HStack>
            )}
          </HStack>
        </HStack>
      )}
    </Box>
  );
}
