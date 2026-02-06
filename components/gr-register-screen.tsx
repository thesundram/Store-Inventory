"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import BackToHomeButton from "@/components/back-to-home-button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useP2P } from "@/context/p2p-context"
import { FilterIcon, ColumnsIcon, SearchIcon, XIcon } from "lucide-react"
import { VENDORS } from "@/lib/constants"

interface GrRegisterScreenProps {
  onBack: () => void
}

type ColumnKey = "grNumber" | "poNumber" | "vendor" | "itemCount" | "totalQty" | "totalValue" | "createdAt" | "items"

interface ColumnConfig {
  key: ColumnKey
  label: string
  visible: boolean
  filterable: boolean
}

export default function GrRegisterScreen({ onBack }: GrRegisterScreenProps) {
  const { goodsReceipts, purchaseOrders } = useP2P()

  // Column visibility state
  const [columns, setColumns] = useState<ColumnConfig[]>([
    { key: "grNumber", label: "GR Number", visible: true, filterable: true },
    { key: "poNumber", label: "PO Number", visible: true, filterable: true },
    { key: "vendor", label: "Vendor", visible: true, filterable: true },
    { key: "itemCount", label: "No. of Items", visible: true, filterable: false },
    { key: "totalQty", label: "Total Qty Received", visible: true, filterable: false },
    { key: "totalValue", label: "Total Value", visible: true, filterable: false },
    { key: "createdAt", label: "Received Date", visible: true, filterable: true },
    { key: "items", label: "Item Details", visible: true, filterable: false },
  ])

  // Filter state
  const [filters, setFilters] = useState<Record<string, string>>({
    grNumber: "",
    poNumber: "",
    vendor: "all",
    createdAt: "",
  })

  const [showFilters, setShowFilters] = useState(false)

  // Toggle column visibility
  const toggleColumn = (key: ColumnKey) => {
    setColumns((prev) =>
      prev.map((col) => (col.key === key ? { ...col, visible: !col.visible } : col))
    )
  }

  // Update filter
  const updateFilter = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      grNumber: "",
      poNumber: "",
      vendor: "all",
      createdAt: "",
    })
  }

  // Get PO details by ID
  const getPoDetails = (poId: string) => {
    const poIndex = purchaseOrders.findIndex((po) => po.id === poId)
    const po = purchaseOrders.find((po) => po.id === poId)
    return {
      poNumber: poIndex >= 0 ? `PO-${String(poIndex + 1).padStart(4, "0")}` : poId.substring(0, 8),
      vendor: po?.vendor || "N/A",
      poItems: po?.items || [],
    }
  }

  // Processed data with computed fields
  const processedData = useMemo(() => {
    return goodsReceipts.map((gr, index) => {
      const poDetails = getPoDetails(gr.poId)
      
      // Calculate value based on PO item rates
      const totalValue = gr.items.reduce((sum, grItem) => {
        const poItem = poDetails.poItems.find((item) => item.id === grItem.poItemId)
        const rate = poItem?.rate || 0
        return sum + (grItem.receivedQuantity * rate)
      }, 0)

      return {
        ...gr,
        grNumber: `GR-${String(index + 1).padStart(4, "0")}`,
        poNumber: poDetails.poNumber,
        vendor: poDetails.vendor,
        itemCount: gr.items.length,
        totalQty: gr.items.reduce((sum, item) => sum + item.receivedQuantity, 0),
        totalValue,
        createdDate: new Date(gr.createdAt).toLocaleDateString(),
        poItems: poDetails.poItems,
      }
    })
  }, [goodsReceipts, purchaseOrders])

  // Filtered data
  const filteredData = useMemo(() => {
    return processedData.filter((gr) => {
      if (filters.grNumber && !gr.grNumber.toLowerCase().includes(filters.grNumber.toLowerCase())) {
        return false
      }
      if (filters.poNumber && !gr.poNumber.toLowerCase().includes(filters.poNumber.toLowerCase())) {
        return false
      }
      if (filters.vendor && filters.vendor !== "all" && gr.vendor !== filters.vendor) {
        return false
      }
      if (filters.createdAt && !gr.createdDate.includes(filters.createdAt)) {
        return false
      }
      return true
    })
  }, [processedData, filters])

  const isColumnVisible = (key: ColumnKey) => columns.find((c) => c.key === key)?.visible ?? true

  // Summary totals
  const summaryTotals = useMemo(() => ({
    totalQty: filteredData.reduce((sum, gr) => sum + gr.totalQty, 0),
    totalValue: filteredData.reduce((sum, gr) => sum + gr.totalValue, 0),
  }), [filteredData])

  return (
    <Card className="w-full max-w-7xl mx-auto">
      <CardHeader className="bg-gradient-to-r from-slate-900 to-cyan-700 text-white rounded-t-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="text-2xl">Goods Receipt Register</CardTitle>
            <CardDescription className="text-slate-200">
              Comprehensive view of all Goods Receipts ({filteredData.length} of {goodsReceipts.length} records)
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {/* Column Toggle */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="bg-transparent border-white text-white hover:bg-white/20">
                  <ColumnsIcon className="h-4 w-4 mr-2" /> Columns
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56" align="end">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Toggle Columns</h4>
                  {columns.map((col) => (
                    <div key={col.key} className="flex items-center space-x-2">
                      <Checkbox
                        id={`col-${col.key}`}
                        checked={col.visible}
                        onCheckedChange={() => toggleColumn(col.key)}
                      />
                      <Label htmlFor={`col-${col.key}`} className="text-sm cursor-pointer">
                        {col.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            {/* Filter Toggle */}
            <Button
              variant="outline"
              size="sm"
              className={`bg-transparent border-white text-white hover:bg-white/20 ${showFilters ? "bg-white/20" : ""}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <FilterIcon className="h-4 w-4 mr-2" /> Filters
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {/* Filter Panel */}
        {showFilters && (
          <div className="mb-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-sm text-slate-700">Filter Options</h4>
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-slate-500 hover:text-slate-700">
                <XIcon className="h-4 w-4 mr-1" /> Clear All
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1">
                <Label className="text-xs text-slate-600">GR Number</Label>
                <div className="relative">
                  <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search GR..."
                    value={filters.grNumber}
                    onChange={(e) => updateFilter("grNumber", e.target.value)}
                    className="pl-8 h-9"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-slate-600">PO Number</Label>
                <div className="relative">
                  <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search PO..."
                    value={filters.poNumber}
                    onChange={(e) => updateFilter("poNumber", e.target.value)}
                    className="pl-8 h-9"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-slate-600">Vendor</Label>
                <Select value={filters.vendor} onValueChange={(value) => updateFilter("vendor", value)}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="All Vendors" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Vendors</SelectItem>
                    {VENDORS.map((vendor) => (
                      <SelectItem key={vendor} value={vendor}>{vendor}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-slate-600">Received Date</Label>
                <Input
                  type="date"
                  value={filters.createdAt}
                  onChange={(e) => updateFilter("createdAt", e.target.value)}
                  className="h-9"
                />
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        {goodsReceipts.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <p className="text-lg">No Goods Receipts recorded yet.</p>
            <p className="text-sm mt-1">Create a new GR to see it here.</p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <p className="text-lg">No records match your filters.</p>
            <Button variant="link" onClick={clearFilters}>Clear filters</Button>
          </div>
        ) : (
          <div className="overflow-x-auto border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-100">
                  {isColumnVisible("grNumber") && <TableHead className="font-semibold">GR Number</TableHead>}
                  {isColumnVisible("poNumber") && <TableHead className="font-semibold">PO Number</TableHead>}
                  {isColumnVisible("vendor") && <TableHead className="font-semibold">Vendor</TableHead>}
                  {isColumnVisible("itemCount") && <TableHead className="font-semibold text-center">Items</TableHead>}
                  {isColumnVisible("totalQty") && <TableHead className="font-semibold text-right">Total Qty</TableHead>}
                  {isColumnVisible("totalValue") && <TableHead className="font-semibold text-right">Total Value</TableHead>}
                  {isColumnVisible("createdAt") && <TableHead className="font-semibold">Received Date</TableHead>}
                  {isColumnVisible("items") && <TableHead className="font-semibold">Item Details</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((gr) => (
                  <TableRow key={gr.id} className="hover:bg-slate-50">
                    {isColumnVisible("grNumber") && (
                      <TableCell className="font-medium text-cyan-700">{gr.grNumber}</TableCell>
                    )}
                    {isColumnVisible("poNumber") && (
                      <TableCell>
                        <span className="bg-slate-200 px-2 py-0.5 rounded text-xs font-medium">
                          {gr.poNumber}
                        </span>
                      </TableCell>
                    )}
                    {isColumnVisible("vendor") && <TableCell>{gr.vendor}</TableCell>}
                    {isColumnVisible("itemCount") && (
                      <TableCell className="text-center">{gr.itemCount}</TableCell>
                    )}
                    {isColumnVisible("totalQty") && (
                      <TableCell className="text-right">{gr.totalQty.toFixed(2)}</TableCell>
                    )}
                    {isColumnVisible("totalValue") && (
                      <TableCell className="text-right font-medium">{gr.totalValue.toFixed(2)}</TableCell>
                    )}
                    {isColumnVisible("createdAt") && <TableCell>{gr.createdDate}</TableCell>}
                    {isColumnVisible("items") && (
                      <TableCell className="max-w-xs">
                        <div className="space-y-1">
                          {gr.items.slice(0, 2).map((item) => {
                            const poItem = gr.poItems.find((p) => p.id === item.poItemId)
                            const rate = poItem?.rate || 0
                            return (
                              <div key={item.id} className="text-xs text-slate-600 truncate">
                                {item.itemCode}: {item.itemDescription} ({item.receivedQuantity} {item.unit} @ {rate.toFixed(2)})
                              </div>
                            )
                          })}
                          {gr.items.length > 2 && (
                            <div className="text-xs text-cyan-600 font-medium">
                              +{gr.items.length - 2} more items
                            </div>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
                {/* Summary Row */}
                <TableRow className="bg-slate-100 font-semibold">
                  {isColumnVisible("grNumber") && <TableCell>Total</TableCell>}
                  {isColumnVisible("poNumber") && <TableCell />}
                  {isColumnVisible("vendor") && <TableCell />}
                  {isColumnVisible("itemCount") && <TableCell />}
                  {isColumnVisible("totalQty") && (
                    <TableCell className="text-right">{summaryTotals.totalQty.toFixed(2)}</TableCell>
                  )}
                  {isColumnVisible("totalValue") && (
                    <TableCell className="text-right">{summaryTotals.totalValue.toFixed(2)}</TableCell>
                  )}
                  {isColumnVisible("createdAt") && <TableCell />}
                  {isColumnVisible("items") && <TableCell />}
                </TableRow>
              </TableBody>
            </Table>
          </div>
        )}

        {/* Summary Footer */}
        {filteredData.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600">
            <div className="bg-slate-100 px-3 py-1 rounded">
              <span className="font-medium">Total GRs:</span> {filteredData.length}
            </div>
            <div className="bg-cyan-100 px-3 py-1 rounded text-cyan-800">
              <span className="font-medium">Total Qty Received:</span> {summaryTotals.totalQty.toFixed(2)}
            </div>
            <div className="bg-green-100 px-3 py-1 rounded text-green-800">
              <span className="font-medium">Total Value:</span> {summaryTotals.totalValue.toFixed(2)}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="border-t pt-4">
  <BackToHomeButton onBack={onBack} />
  </CardFooter>
    </Card>
  )
}
