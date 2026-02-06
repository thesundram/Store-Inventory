"use client"

import { Button } from "@/components/ui/button"
import BackToHomeButton from "@/components/back-to-home-button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useP2P, type PurchaseOrder } from "@/context/p2p-context"
import { useState } from "react"

interface PoApprovalScreenProps {
  onBack: () => void
  onSelectPO: (po: PurchaseOrder) => void
}

export default function PoApprovalScreen({ onBack, onSelectPO }: PoApprovalScreenProps) {
  const { purchaseOrders, approvePO, rejectPO } = useP2P()
  const [selectedPoId, setSelectedPoId] = useState<string | null>(null)

  const pendingPOs = purchaseOrders.filter((po) => po.status === "Pending")
  const selectedPO = purchaseOrders.find((po) => po.id === selectedPoId)

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Purchase Order Approval</CardTitle>
        <CardDescription>Review and approve or reject pending purchase orders.</CardDescription>
      </CardHeader>
      <CardContent>
        {pendingPOs.length === 0 ? (
          <p className="text-center text-gray-500">No pending Purchase Orders for approval.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PO ID</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Linked PRs</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingPOs.map((po) => (
                <TableRow key={po.id}>
                  <TableCell className="font-medium">{po.id.substring(0, 8)}...</TableCell>
                  <TableCell>{po.vendor}</TableCell>
                  <TableCell>
                    {po.prIds.length > 0 ? po.prIds.map((id) => id.substring(0, 8) + "...").join(", ") : "N/A"}
                  </TableCell>
                  <TableCell>
                    {po.items.map((item) => (
                      <div key={item.id}>
                        {item.itemDescription} ({item.poQuantity} {item.unit})
                      </div>
                    ))}
                  </TableCell>
                  <TableCell>{po.status}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => setSelectedPoId(po.id)} className="mr-2">
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {selectedPoId && selectedPO && (
          <Card className="mt-6 border">
            <CardHeader>
              <CardTitle>PO Details: {selectedPO.id.substring(0, 8)}...</CardTitle>
              <CardDescription>Vendor: {selectedPO.vendor}</CardDescription>
            </CardHeader>
            <CardContent>
              <h4 className="font-semibold mb-4">Line Items with Price Details:</h4>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item Code</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead className="text-right">Rate</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                      <TableHead className="text-right">GST %</TableHead>
                      <TableHead className="text-right">GST Amt</TableHead>
                      <TableHead className="text-right">Total Amt</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedPO.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.itemCode}</TableCell>
                        <TableCell>{item.itemDescription}</TableCell>
                        <TableCell className="text-right">{item.poQuantity.toFixed(2)}</TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell className="text-right">{item.rate.toFixed(2)}</TableCell>
                        <TableCell className="text-right">{item.value.toFixed(2)}</TableCell>
                        <TableCell className="text-right">{item.gstPercentage.toFixed(2)}</TableCell>
                        <TableCell className="text-right">{item.gstAmount.toFixed(2)}</TableCell>
                        <TableCell className="text-right font-semibold">{item.totalAmount.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="font-bold bg-gray-50">
                      <TableCell colSpan={5} className="text-right">Page Total:</TableCell>
                      <TableCell className="text-right">
                        {selectedPO.items.reduce((sum, item) => sum + item.value, 0).toFixed(2)}
                      </TableCell>
                      <TableCell></TableCell>
                      <TableCell className="text-right">
                        {selectedPO.items.reduce((sum, item) => sum + item.gstAmount, 0).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        {selectedPO.items.reduce((sum, item) => sum + item.totalAmount, 0).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSelectedPoId(null)}>
                Close
              </Button>
              <Button
                onClick={() => {
                  approvePO(selectedPO.id)
                  setSelectedPoId(null)
                  onSelectPO(selectedPO)
                }}
              >
                Approve
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  rejectPO(selectedPO.id)
                  setSelectedPoId(null)
                }}
              >
                Reject
              </Button>
            </CardFooter>
          </Card>
        )}
      </CardContent>
      <CardFooter>
        <BackToHomeButton onBack={onBack} />
      </CardFooter>
    </Card>
  )
}
