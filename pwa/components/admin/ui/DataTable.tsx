"use client"

import { Box, Button, HStack, Spinner, Table, Text } from "@chakra-ui/react"

export interface Column<T> {
  key: string
  header: string
  render: (row: T) => React.ReactNode
  width?: string
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
}: DataTableProps<T>) {
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  return (
    <Box>
      <Box overflowX="auto" rounded="lg" borderWidth="1px" borderColor="border.subtle">
        <Table.Root variant="outline" size="sm">
          <Table.Header>
            <Table.Row bg="bg.subtle">
              {columns.map((col) => (
                <Table.ColumnHeader
                  key={col.key}
                  px="4"
                  py="3"
                  fontWeight="semibold"
                  fontSize="xs"
                  textTransform="uppercase"
                  letterSpacing="wider"
                  color="fg.muted"
                  w={col.width}
                >
                  {col.header}
                </Table.ColumnHeader>
              ))}
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
