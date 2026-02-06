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

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Current Stock Levels</CardTitle>
        <CardDescription>Overview of all items currently in stock.</CardDescription>
      </CardHeader>
      <CardContent>
        {stock.length === 0 ? (
          <p className="text-center text-gray-500">No items in stock yet. Receive some goods first!</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item Code</TableHead>
                <TableHead>Item Description</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead className="text-right">Current Stock</TableHead>
                <TableHead className="text-right">Weighted Avg Price</TableHead>
                <TableHead className="text-right">Stock Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stock.map((item) => (
                <TableRow key={item.itemCode}>
                  <TableCell className="font-medium">{item.itemCode}</TableCell>
                  <TableCell>{item.itemDescription}</TableCell>
                  <TableCell>{item.unit}</TableCell>
                  <TableCell className="text-right">{item.currentStock.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{item.weightedAvgPrice.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{item.totalValue.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
      <CardFooter>
        <BackToHomeButton onBack={onBack} />
      </CardFooter>
    </Card>
  )
}
