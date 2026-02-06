"use client"

import { Button } from "@/components/ui/button"
import BackToHomeButton from "@/components/back-to-home-button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useP2P, type PurchaseRequisition } from "@/context/p2p-context"
import { useState } from "react"

interface PrApprovalScreenProps {
  onBack: () => void
  onSelectPR: (pr: PurchaseRequisition) => void
}

export default function PrApprovalScreen({ onBack, onSelectPR }: PrApprovalScreenProps) {
  const { purchaseRequisitions, approvePR, rejectPR } = useP2P()
  const [selectedPrId, setSelectedPrId] = useState<string | null>(null)

  const pendingPRs = purchaseRequisitions.filter((pr) => pr.status === "Pending")
  const selectedPR = purchaseRequisitions.find((pr) => pr.id === selectedPrId)

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Purchase Requisition Approval</CardTitle>
        <CardDescription>Review and approve or reject pending purchase requisitions.</CardDescription>
      </CardHeader>
      <CardContent>
        {pendingPRs.length === 0 ? (
          <p className="text-center text-gray-500">No pending Purchase Requisitions for approval.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PR ID</TableHead>
                <TableHead>Requested By</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingPRs.map((pr) => (
                <TableRow key={pr.id}>
                  <TableCell className="font-medium">{pr.id.substring(0, 8)}...</TableCell>
                  <TableCell>{pr.requestedBy}</TableCell>
                  <TableCell>
                    {pr.items.map((item) => (
                      <div key={item.id}>
                        {item.itemDescription} ({item.quantity} {item.unit})
                      </div>
                    ))}
                  </TableCell>
                  <TableCell>{pr.status}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => setSelectedPrId(pr.id)} className="mr-2">
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {selectedPrId && selectedPR && (
          <Card className="mt-6 border">
            <CardHeader>
              <CardTitle>PR Details: {selectedPR.id.substring(0, 8)}...</CardTitle>
              <CardDescription>Requested By: {selectedPR.requestedBy}</CardDescription>
            </CardHeader>
            <CardContent>
              <h4 className="font-semibold mb-2">Items:</h4>
              <ul>
                {selectedPR.items.map((item) => (
                  <li key={item.id}>
                    - {item.itemCode}: {item.itemDescription} ({item.quantity} {item.unit})
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSelectedPrId(null)}>
                Close
              </Button>
              <Button
                onClick={() => {
                  approvePR(selectedPR.id)
                  setSelectedPrId(null)
                  onSelectPR(selectedPR)
                }}
              >
                Approve
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  rejectPR(selectedPR.id)
                  setSelectedPrId(null)
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
