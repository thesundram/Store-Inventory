"use client"

import { Button } from "@/components/ui/button"
import BackToHomeButton from "@/components/back-to-home-button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useP2P } from "@/context/p2p-context"

interface StockViewScreenProps {
  onBack: () => void
}

export default function StockViewScreen({ onBack }: StockViewScreenProps) {
  const { stock } = useP2P()

  const totalQaPassQty = stock.reduce((sum, item) => sum + item.qaPassQty, 0)
  const totalDamagedQty = stock.reduce((sum, item) => sum + item.damagedQty, 0)

  return (
    <Card className="w-full max-w-5xl mx-auto">
      <CardHeader>
        <CardTitle>Current Stock Levels</CardTitle>
        <CardDescription>Overview of all items in stock, categorized by Quality Pass and Damaged quantities.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {stock.length === 0 ? (
          <p className="text-center text-gray-500">No items in stock yet. Receive some goods first!</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-sky-50">
                    <TableHead>Item Code</TableHead>
                    <TableHead>Item Description</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead className="text-right">QA Pass Qty</TableHead>
                    <TableHead className="text-right">Damage Qty</TableHead>
                    <TableHead className="text-right">Total Stock</TableHead>
                    <TableHead className="text-right">Weighted Avg Price</TableHead>
                    <TableHead className="text-right">Stock Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stock.map((item) => {
                    const totalStock = item.qaPassQty + item.damagedQty
                    return (
                      <TableRow key={item.itemCode}>
                        <TableCell className="font-medium text-sky-700">{item.itemCode}</TableCell>
                        <TableCell>{item.itemDescription}</TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell className="text-right font-semibold text-green-600">{item.qaPassQty.toFixed(2)}</TableCell>
                        <TableCell className="text-right font-semibold text-red-600">{item.damagedQty.toFixed(2)}</TableCell>
                        <TableCell className="text-right font-bold">{totalStock.toFixed(2)}</TableCell>
                        <TableCell className="text-right">{item.weightedAvgPrice.toFixed(2)}</TableCell>
                        <TableCell className="text-right">{item.totalValue.toFixed(2)}</TableCell>
                      </TableRow>
                    )
                  })}
                  <TableRow className="font-bold bg-sky-100 border-t-2">
                    <TableCell colSpan={3} className="text-right">TOTAL:</TableCell>
                    <TableCell className="text-right text-green-600">{totalQaPassQty.toFixed(2)}</TableCell>
                    <TableCell className="text-right text-red-600">{totalDamagedQty.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{(totalQaPassQty + totalDamagedQty).toFixed(2)}</TableCell>
                    <TableCell colSpan={2}></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
                <p className="text-sm text-gray-600">QA Pass Qty</p>
                <p className="text-2xl font-bold text-green-600">{totalQaPassQty.toFixed(2)}</p>
                <p className="text-xs text-gray-500 mt-1">Available for issue</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg border-2 border-red-200">
                <p className="text-sm text-gray-600">Damage Qty</p>
                <p className="text-2xl font-bold text-red-600">{totalDamagedQty.toFixed(2)}</p>
                <p className="text-xs text-gray-500 mt-1">Cannot be issued</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                <p className="text-sm text-gray-600">Total Stock</p>
                <p className="text-2xl font-bold text-blue-600">{(totalQaPassQty + totalDamagedQty).toFixed(2)}</p>
                <p className="text-xs text-gray-500 mt-1">QA Pass + Damage</p>
              </div>
            </div>
          </>
        )}
      </CardContent>
      <CardFooter>
        <BackToHomeButton onBack={onBack} />
      </CardFooter>
    </Card>
  )
}
