"use client"

import { Box, Button, HStack, Icon, Spinner, Table, Text } from "@chakra-ui/react"
import { LuChevronUp, LuChevronDown, LuChevronsUpDown } from "react-icons/lu"

export type SortDir = "asc" | "desc"

export interface SortState {
  field: string
  dir: SortDir
}

export interface Column<T> {
  key: string
  header: string
  render: (row: T) => React.ReactNode
  width?: string
  sortField?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  isLoading?: boolean
  keyExtractor: (row: T) => string | number
  page?: number
  totalItems?: number
  itemsPerPage?: number
  onPageChange?: (page: number) => void
  emptyMessage?: string
  sort?: SortState
  onSortChange?: (sort: SortState) => void
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
}: DataTableProps<T>) {
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  const handleHeaderClick = (col: Column<T>) => {
    if (!col.sortField || !onSortChange) return
    if (sort?.field === col.sortField) {
      onSortChange({ field: col.sortField, dir: sort.dir === "asc" ? "desc" : "asc" })
    } else {
      onSortChange({ field: col.sortField, dir: "asc" })
    }
  }

  return (
    <Box>
      <Box overflowX="auto" rounded="lg" borderWidth="1px" borderColor="border.subtle">
        <Table.Root variant="outline" size="sm">
          <Table.Header>
            <Table.Row bg="bg.subtle">
              {columns.map((col) => {
                const isSorted = sort?.field === col.sortField
                const isSortable = !!col.sortField && !!onSortChange
                return (
                  <Table.ColumnHeader
                    key={col.key}
                    px="4"
                    py="3"
                    fontWeight="semibold"
                    fontSize="xs"
                    textTransform="uppercase"
                    letterSpacing="wider"
                    color={isSorted ? "colorPalette.fg" : "fg.muted"}
                    w={col.width}
                    cursor={isSortable ? "pointer" : "default"}
                    userSelect="none"
                    onClick={() => handleHeaderClick(col)}
                    _hover={isSortable ? { color: "fg.default" } : undefined}
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
                )
              })}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {isLoading ? (
              <Table.Row>
                <Table.Cell colSpan={columns.length} textAlign="center" py="8">
                  <Spinner size="md" color="primary.500" />
                </Table.Cell>
              </Table.Row>
            ) : data.length === 0 ? (
              <Table.Row>
                <Table.Cell colSpan={columns.length} textAlign="center" py="8">
                  <Text color="fg.muted" fontSize="sm">{emptyMessage}</Text>
                </Table.Cell>
              </Table.Row>
            ) : (
              data.map((row) => (
                <Table.Row key={keyExtractor(row)} _hover={{ bg: "bg.subtle" }} transition="background 0.1s">
                  {columns.map((col) => (
                    <Table.Cell key={col.key} px="4" py="3" fontSize="sm">
                      {col.render(row)}
                    </Table.Cell>
                  ))}
                </Table.Row>
              ))
            )}
          </Table.Body>
        </Table.Root>
      </Box>

      {onPageChange && totalPages > 1 && (
        <HStack justify="space-between" mt="4" px="1">
          <Text fontSize="sm" color="fg.muted">
            {totalItems} résultat{totalItems > 1 ? "s" : ""}
          </Text>
          <HStack gap="2">
            <Button
              size="sm"
              variant="outline"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              ← Précédent
            </Button>
            <Text fontSize="sm" color="fg.muted">
              Page {page} / {totalPages}
            </Text>
            <Button
              size="sm"
              variant="outline"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              Suivant →
            </Button>
          </HStack>
        </HStack>
      )}
    </Box>
  )
}
