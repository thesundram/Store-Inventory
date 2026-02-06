"use client"

import { Button } from "@/components/ui/button"
import BackToHomeButton from "@/components/back-to-home-button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { useP2P } from "@/context/p2p-context"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, Tooltip } from "recharts"

interface DashboardScreenProps {
  onBack: () => void
}

export default function DashboardScreen({ onBack }: DashboardScreenProps) {
  const { purchaseRequisitions, purchaseOrders, goodsReceipts, stock } = useP2P()

  // Data for PR vs PO vs GRN Chart
  const procurementData = [
    { name: "PRs", fullName: "Purchase Requisitions", count: purchaseRequisitions.length },
    { name: "POs", fullName: "Purchase Orders", count: purchaseOrders.length },
    { name: "GRs", fullName: "Goods Receipts", count: goodsReceipts.length },
  ]

  // Data for Stock vs Total Received Chart
  const totalCurrentStock = stock.reduce((sum, item) => sum + item.currentStock, 0)
  const totalReceivedQuantity = goodsReceipts.reduce(
    (sum, gr) => sum + gr.items.reduce((itemSum, item) => itemSum + item.receivedQuantity, 0),
    0,
  )
  const totalIssuedQuantity = totalReceivedQuantity - totalCurrentStock

  const inventoryData = [
    { name: "Received", quantity: totalReceivedQuantity },
    { name: "Current Stock", quantity: totalCurrentStock },
    { name: "Issued", quantity: totalIssuedQuantity > 0 ? totalIssuedQuantity : 0 },
  ]

  return (
    <Card className="w-full max-w-5xl mx-auto">
      <CardHeader>
        <CardTitle>Store Inventory Dashboard</CardTitle>
        <CardDescription>Visual overview of key inventory metrics.</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* PR vs PO vs GRN Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Procurement Flow Overview</CardTitle>
            <CardDescription>Comparison of Purchase Requisitions, Orders, and Goods Receipts.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={procurementData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip 
                  formatter={(value, name) => [value, "Count"]}
                  labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName || label}
                />
                <Legend />
                <Bar dataKey="count" fill="#0e7490" name="Total Count" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Stock vs Total Received Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Inventory Flow Overview</CardTitle>
            <CardDescription>Total Received vs Current Stock vs Issued.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={inventoryData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip formatter={(value) => [Number(value).toFixed(2), "Quantity"]} />
                <Legend />
                <Bar dataKey="quantity" fill="#1e293b" name="Quantity" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </CardContent>
      <CardFooter>
        <BackToHomeButton onBack={onBack} />
      </CardFooter>
    </Card>
  )
}
