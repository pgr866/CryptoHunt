'use client'

import * as React from 'react'
import axios from 'axios'
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { ArrowUpDown, Search } from 'lucide-react'
import { MiniChart } from '@/components/minichart'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

type Coin = {
  id: string
  name: string
  symbol: string
  imageUrl: string
  current_price: number
  price_change_percentage_24h: number
  market_cap: number
  market_cap_rank: number
  total_volume: number
  sparkline_in_7d?: {
    price: number[]
  }
}

export default function PricesPage() {
  const [data, setData] = React.useState<Coin[]>([])
  const [filteredData, setFilteredData] = React.useState<Coin[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')
  const [search, setSearch] = React.useState('')
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [page, setPage] = React.useState(1)

  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const res = await axios.get(`${process.env.NEXTAUTH_URL}/api/coins`, {
          params: {
            per_page: 100,
            page,
          },
        })
        setData(res.data)
        setFilteredData(res.data)
        setLoading(false)
      } catch (err: any) {
        setError('Failed to fetch coin data')
        setLoading(false)
      }
    }

    fetchData()
  }, [page])

  React.useEffect(() => {
    if (search.trim()) {
      setFilteredData(
        data.filter((coin) =>
          coin.name.toLowerCase().includes(search.toLowerCase())
        )
      )
    } else {
      setFilteredData(data)
    }
  }, [search, data])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    setPage(1)
  }

  const columns: ColumnDef<Coin>[] = [
    {
      accessorKey: 'market_cap_rank',
      header: () => <span className="ml-4">#</span>,
      cell: ({ row }) => <div className="ml-4">{row.getValue('market_cap_rank')}</div>,
    },
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const coin = row.original
        return (
          <div className="flex items-center gap-2 ml-2">
            <img src={coin.imageUrl} alt={coin.name} className="w-5 h-5" />
            <span>{coin.name}</span>
            <span className="text-muted-foreground uppercase">({coin.symbol})</span>
          </div>
        )
      },
    },
    {
      accessorKey: 'current_price',
      header: 'Price',
      cell: ({ row }) => <div>${parseFloat(row.getValue('current_price'))}</div>,
    },
    {
      accessorKey: 'price_change_percentage_24h',
      header: '24h %',
      cell: ({ row }) => {
        const value = row.getValue('price_change_percentage_24h') as number
        return (
          <div className={value > 0 ? 'text-green-500' : 'text-red-500'}>
            {value.toFixed(2)}%
          </div>
        )
      },
    },
    {
      accessorKey: 'market_cap',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Market Cap
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="ml-4">${parseFloat(row.getValue('market_cap'))}</div>
      ),
    },
    {
      accessorKey: 'total_volume',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Volume
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="ml-4">${parseFloat(row.getValue('total_volume'))}</div>
      ),
    },
    {
      id: 'chart',
      header: 'Last 7d',
      cell: ({ row }) => {
        const sparkline = row.original.sparkline_in_7d?.price
        return sparkline && sparkline.length > 0 ? (
          <MiniChart data={sparkline} />
        ) : (
          <span className="text-muted-foreground text-xs">N/A</span>
        )
      },
    },
  ]

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
    manualPagination: true,
    pageCount: -1,
  })

  return (
    <div className="w-full px-8">
      <div className="flex flex-col mx-auto max-w-3xl mb-4">
        <Search className="absolute m-2.5 size-4 text-muted-foreground" />
        <Input
          placeholder="Search coins..."
          value={search}
          onChange={handleSearchChange}
          className="pl-8"
        />
      </div>

      {loading ? (
        <div className="text-center">Loading...</div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="text-center py-4">
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* PAGINATION */}
          <div className="flex items-center justify-between py-4">
            <span className="text-sm text-muted-foreground">Page {page}</span>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={filteredData.length < 50}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
