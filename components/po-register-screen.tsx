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

interface PoRegisterScreenProps {
  onBack: () => void
}

type ColumnKey = "poNumber" | "vendor" | "status" | "linkedPRs" | "itemCount" | "totalQty" | "totalValue" | "totalGst" | "grandTotal" | "createdAt" | "items"

interface ColumnConfig {
  key: ColumnKey
  label: string
  visible: boolean
  filterable: boolean
}

export default function PoRegisterScreen({ onBack }: PoRegisterScreenProps) {
  const { purchaseOrders, purchaseRequisitions } = useP2P()

  // Column visibility state
  const [columns, setColumns] = useState<ColumnConfig[]>([
    { key: "poNumber", label: "PO Number", visible: true, filterable: true },
    { key: "vendor", label: "Vendor", visible: true, filterable: true },
    { key: "status", label: "Status", visible: true, filterable: true },
    { key: "linkedPRs", label: "Linked PRs", visible: true, filterable: false },
    { key: "itemCount", label: "No. of Items", visible: true, filterable: false },
    { key: "totalQty", label: "Total Qty", visible: true, filterable: false },
    { key: "totalValue", label: "Total Value", visible: true, filterable: false },
    { key: "totalGst", label: "Total GST", visible: true, filterable: false },
    { key: "grandTotal", label: "Grand Total", visible: true, filterable: false },
    { key: "createdAt", label: "Created Date", visible: true, filterable: true },
    { key: "items", label: "Item Details", visible: false, filterable: false },
  ])

  // Filter state
  const [filters, setFilters] = useState<Record<string, string>>({
    poNumber: "",
    vendor: "all",
    status: "all",
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
      poNumber: "",
      vendor: "all",
      status: "all",
      createdAt: "",
    })
  }

  // Get PR number by ID
  const getPrNumber = (prId: string) => {
    const index = purchaseRequisitions.findIndex((pr) => pr.id === prId)
    return index >= 0 ? `PR-${String(index + 1).padStart(4, "0")}` : prId.substring(0, 8)
  }

  // Processed data with computed fields
  const processedData = useMemo(() => {
    return purchaseOrders.map((po, index) => ({
      ...po,
      poNumber: `PO-${String(index + 1).padStart(4, "0")}`,
      itemCount: po.items.length,
      totalQty: po.items.reduce((sum, item) => sum + item.poQuantity, 0),
      totalValue: po.items.reduce((sum, item) => sum + item.value, 0),
      totalGst: po.items.reduce((sum, item) => sum + item.gstAmount, 0),
      grandTotal: po.items.reduce((sum, item) => sum + item.totalAmount, 0),
      createdDate: new Date(po.createdAt).toLocaleDateString(),
      linkedPRNumbers: po.prIds.map(getPrNumber),
    }))
  }, [purchaseOrders, purchaseRequisitions])

  // Filtered data
  const filteredData = useMemo(() => {
    return processedData.filter((po) => {
      if (filters.poNumber && !po.poNumber.toLowerCase().includes(filters.poNumber.toLowerCase())) {
        return false
      }
      if (filters.vendor && filters.vendor !== "all" && po.vendor !== filters.vendor) {
        return false
      }
      if (filters.status && filters.status !== "all" && po.status !== filters.status) {
        return false
      }
      if (filters.createdAt && !po.createdDate.includes(filters.createdAt)) {
        return false
      }
      return true
    })
  }, [processedData, filters])

  const isColumnVisible = (key: ColumnKey) => columns.find((c) => c.key === key)?.visible ?? true

  // Summary totals
  const summaryTotals = useMemo(() => ({
    totalValue: filteredData.reduce((sum, po) => sum + po.totalValue, 0),
    totalGst: filteredData.reduce((sum, po) => sum + po.totalGst, 0),
    grandTotal: filteredData.reduce((sum, po) => sum + po.grandTotal, 0),
  }), [filteredData])

  return (
    <Card className="w-full max-w-7xl mx-auto">
      <CardHeader className="bg-gradient-to-r from-slate-900 to-cyan-700 text-white rounded-t-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="text-2xl">Purchase Order Register</CardTitle>
            <CardDescription className="text-slate-200">
              Comprehensive view of all Purchase Orders ({filteredData.length} of {purchaseOrders.length} records)
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
                <Label className="text-xs text-slate-600">Status</Label>
                <Select value={filters.status} onValueChange={(value) => updateFilter("status", value)}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-slate-600">Created Date</Label>
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
        {purchaseOrders.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <p className="text-lg">No Purchase Orders recorded yet.</p>
            <p className="text-sm mt-1">Create a new PO to see it here.</p>
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
                  {isColumnVisible("poNumber") && <TableHead className="font-semibold">PO Number</TableHead>}
                  {isColumnVisible("vendor") && <TableHead className="font-semibold">Vendor</TableHead>}
                  {isColumnVisible("status") && <TableHead className="font-semibold">Status</TableHead>}
                  {isColumnVisible("linkedPRs") && <TableHead className="font-semibold">Linked PRs</TableHead>}
                  {isColumnVisible("itemCount") && <TableHead className="font-semibold text-center">Items</TableHead>}
                  {isColumnVisible("totalQty") && <TableHead className="font-semibold text-right">Total Qty</TableHead>}
                  {isColumnVisible("totalValue") && <TableHead className="font-semibold text-right">Value</TableHead>}
                  {isColumnVisible("totalGst") && <TableHead className="font-semibold text-right">GST</TableHead>}
                  {isColumnVisible("grandTotal") && <TableHead className="font-semibold text-right">Grand Total</TableHead>}
                  {isColumnVisible("createdAt") && <TableHead className="font-semibold">Date</TableHead>}
                  {isColumnVisible("items") && <TableHead className="font-semibold">Item Details</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((po) => (
                  <TableRow key={po.id} className="hover:bg-slate-50">
                    {isColumnVisible("poNumber") && (
                      <TableCell className="font-medium text-cyan-700">{po.poNumber}</TableCell>
                    )}
                    {isColumnVisible("vendor") && <TableCell>{po.vendor}</TableCell>}
                    {isColumnVisible("status") && (
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            po.status === "Approved"
                              ? "bg-green-100 text-green-800"
                              : po.status === "Rejected"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {po.status}
                        </span>
                      </TableCell>
                    )}
                    {isColumnVisible("linkedPRs") && (
                      <TableCell>
                        {po.linkedPRNumbers.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {po.linkedPRNumbers.map((prNum, idx) => (
                              <span key={idx} className="bg-slate-200 px-1.5 py-0.5 rounded text-xs">
                                {prNum}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400">N/A</span>
                        )}
                      </TableCell>
                    )}
                    {isColumnVisible("itemCount") && (
                      <TableCell className="text-center">{po.itemCount}</TableCell>
                    )}
                    {isColumnVisible("totalQty") && (
                      <TableCell className="text-right">{po.totalQty.toFixed(2)}</TableCell>
                    )}
                    {isColumnVisible("totalValue") && (
                      <TableCell className="text-right">{po.totalValue.toFixed(2)}</TableCell>
                    )}
                    {isColumnVisible("totalGst") && (
                      <TableCell className="text-right">{po.totalGst.toFixed(2)}</TableCell>
                    )}
                    {isColumnVisible("grandTotal") && (
                      <TableCell className="text-right font-medium">{po.grandTotal.toFixed(2)}</TableCell>
                    )}
                    {isColumnVisible("createdAt") && <TableCell>{po.createdDate}</TableCell>}
                    {isColumnVisible("items") && (
                      <TableCell className="max-w-xs">
                        <div className="space-y-1">
                          {po.items.slice(0, 2).map((item) => (
                            <div key={item.id} className="text-xs text-slate-600 truncate">
                              {item.itemCode}: {item.itemDescription} ({item.poQuantity} {item.unit} @ {item.rate.toFixed(2)})
                            </div>
                          ))}
                          {po.items.length > 2 && (
                            <div className="text-xs text-cyan-600 font-medium">
                              +{po.items.length - 2} more items
                            </div>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
                {/* Summary Row */}
                <TableRow className="bg-slate-100 font-semibold">
                  {isColumnVisible("poNumber") && <TableCell>Total</TableCell>}
                  {isColumnVisible("vendor") && <TableCell />}
                  {isColumnVisible("status") && <TableCell />}
                  {isColumnVisible("linkedPRs") && <TableCell />}
                  {isColumnVisible("itemCount") && <TableCell />}
                  {isColumnVisible("totalQty") && <TableCell />}
                  {isColumnVisible("totalValue") && (
                    <TableCell className="text-right">{summaryTotals.totalValue.toFixed(2)}</TableCell>
                  )}
                  {isColumnVisible("totalGst") && (
                    <TableCell className="text-right">{summaryTotals.totalGst.toFixed(2)}</TableCell>
                  )}
                  {isColumnVisible("grandTotal") && (
                    <TableCell className="text-right">{summaryTotals.grandTotal.toFixed(2)}</TableCell>
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
              <span className="font-medium">Total POs:</span> {filteredData.length}
            </div>
            <div className="bg-green-100 px-3 py-1 rounded text-green-800">
              <span className="font-medium">Approved:</span> {filteredData.filter((p) => p.status === "Approved").length}
            </div>
            <div className="bg-yellow-100 px-3 py-1 rounded text-yellow-800">
              <span className="font-medium">Pending:</span> {filteredData.filter((p) => p.status === "Pending").length}
            </div>
            <div className="bg-red-100 px-3 py-1 rounded text-red-800">
              <span className="font-medium">Rejected:</span> {filteredData.filter((p) => p.status === "Rejected").length}
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
