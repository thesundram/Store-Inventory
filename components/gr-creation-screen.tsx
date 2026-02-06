"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import BackToHomeButton from "@/components/back-to-home-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { useP2P, type GRItem, type PurchaseOrder } from "@/context/p2p-context"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import QRCode from "qrcode"

interface GrCreationScreenProps {
  onSuccess: () => void
  onBack: () => void
  selectedPoForGr?: PurchaseOrder | null
}

interface GRItemWithAdditionalFields extends Omit<GRItem, "id" | "receivedAt" | "qrCode"> {
  orderedQty?: number
  alreadyReceivedQty?: number
  pendingQty?: number
}

export default function GrCreationScreen({ onSuccess, onBack, selectedPoForGr }: GrCreationScreenProps) {
  const { createGR, purchaseOrders, goodsReceipts } = useP2P()
  const [selectedPoId, setSelectedPoId] = useState<string>(selectedPoForGr?.id || "")
  const [itemsToReceive, setItemsToReceive] = useState<GRItemWithAdditionalFields[]>([])
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [qrCodeUrls, setQrCodeUrls] = useState<{ [key: string]: string }>({})
  const qrCanvasRefs = useRef<{ [key: string]: HTMLCanvasElement | null }>({})

  // Calculate received quantities for each PO item
  const getReceivedQuantityForPoItem = (poId: string, poItemId: string): number => {
    return goodsReceipts
      .filter((gr) => gr.poId === poId)
      .flatMap((gr) => gr.items)
      .filter((grItem) => grItem.poItemId === poItemId)
      .reduce((total, grItem) => total + grItem.receivedQuantity, 0)
  }

  // Check if a PO has pending items (not fully received)
  const hasPendingItems = (po: PurchaseOrder): boolean => {
    return po.items.some((poItem) => {
      const receivedQty = getReceivedQuantityForPoItem(po.id, poItem.id)
      return receivedQty < poItem.poQuantity
    })
  }

  // Filter approved POs that still have pending items
  const approvedPOs = purchaseOrders.filter((po) => po.status === "Approved" && hasPendingItems(po))
  const currentPO = approvedPOs.find((po) => po.id === selectedPoId)

  useEffect(() => {
    if (currentPO) {
      // Only show items with pending quantities and default to pending quantity
      const itemsWithPending = currentPO.items
        .map((poItem) => {
          const receivedQty = getReceivedQuantityForPoItem(currentPO.id, poItem.id)
          const pendingQty = poItem.poQuantity - receivedQty
          return {
            poItemId: poItem.id,
            itemCode: poItem.itemCode,
            itemDescription: poItem.itemDescription,
            receivedQuantity: pendingQty,
            unit: poItem.unit,
            orderedQty: poItem.poQuantity,
            alreadyReceivedQty: receivedQty,
            pendingQty: pendingQty,
            manufacturingDate: "",
            expiryDate: "",
            invoiceNo: "",
            invoiceDate: "",
          }
        })
        .filter((item) => item.pendingQty && item.pendingQty > 0)

      setItemsToReceive(itemsWithPending)
    } else {
      setItemsToReceive([])
    }
  }, [selectedPoId, currentPO])

  const handleItemFieldChange = (index: number, field: keyof GRItemWithAdditionalFields, value: string | number) => {
    setItemsToReceive((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)))
  }

  // Generate QR code for an item
  const generateQRCode = async (item: GRItemWithAdditionalFields, index: number) => {
    if (!item.manufacturingDate || !item.expiryDate || !item.invoiceNo || !item.invoiceDate) {
      return
    }
    
    const qrData = `${item.itemCode}|${item.manufacturingDate}|${item.expiryDate}|${item.invoiceNo}|${item.invoiceDate}`
    
    try {
      const url = await QRCode.toDataURL(qrData, {
        width: 200,
        margin: 2,
      })
      setQrCodeUrls((prev) => ({ ...prev, [index]: url }))
    } catch (err) {
      console.error("Error generating QR code:", err)
    }
  }

  // Print QR code
  const handlePrintQRCode = (index: number) => {
    const qrUrl = qrCodeUrls[index]
    if (!qrUrl) return

    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Print QR Code</title>
            <style>
              body { display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
              img { max-width: 100%; }
            </style>
          </head>
          <body>
            <img src="${qrUrl}" alt="QR Code" />
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPoId) {
      setMessage({ type: "error", text: "Please select a Purchase Order." })
      return
    }
    if (itemsToReceive.length === 0) {
      setMessage({ type: "error", text: "No items to receive for this PO." })
      return
    }
    for (const item of itemsToReceive) {
      if (item.receivedQuantity <= 0) {
        setMessage({ type: "error", text: "Received quantity must be a positive number." })
        return
      }
      if (!item.manufacturingDate || !item.expiryDate || !item.invoiceNo || !item.invoiceDate) {
        setMessage({ type: "error", text: "Please fill all fields (Manufacturing Date, Expiry Date, Invoice No, Invoice Date)." })
        return
      }
    }

    // Remove extra fields before creating GR
    const itemsForGR = itemsToReceive.map(({ orderedQty, alreadyReceivedQty, pendingQty, ...rest }) => rest)
    createGR(selectedPoId, itemsForGR)
    setMessage({ type: "success", text: "Goods Receipt created successfully with QR codes!" })
    setSelectedPoId("")
    setItemsToReceive([])
    setQrCodeUrls({})
    onSuccess()
  }

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle>Create Goods Receipt</CardTitle>
        <CardDescription>Record the receipt of goods against an approved Purchase Order.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="poSelect">Select Purchase Order</Label>
            <Select value={selectedPoId} onValueChange={setSelectedPoId}>
              <SelectTrigger id="poSelect" className="h-10">
                <SelectValue placeholder="Select an approved PO" />
              </SelectTrigger>
              <SelectContent>
                {approvedPOs.length === 0 && <p className="p-2 text-sm text-gray-500">No approved POs available.</p>}
                {approvedPOs.map((po) => (
                  <SelectItem key={po.id} value={po.id}>
                    PO: {po.id.substring(0, 8)}... (Vendor: {po.vendor})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {currentPO && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Items to Receive for PO {currentPO.id.substring(0, 8)}...</h3>
              {itemsToReceive.map((item, index) => (
                <Card key={item.poItemId} className="border-2">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">
                      {item.itemCode} - {item.itemDescription} ({item.unit})
                    </CardTitle>
                    <CardDescription>
                      Ordered: {item.orderedQty} | Already Received: {item.alreadyReceivedQty} | Pending: {item.pendingQty}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`receivedQuantity-${index}`}>Received Qty*</Label>
                        <Input
                          id={`receivedQuantity-${index}`}
                          type="number"
                          placeholder="e.g., 100"
                          min="0.01"
                          step="0.01"
                          value={item.receivedQuantity}
                          onChange={(e) => handleItemFieldChange(index, "receivedQuantity", Number(e.target.value))}
                          required
                          className="h-10"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`manufacturingDate-${index}`}>Manufacturing Date (M_DT)*</Label>
                        <Input
                          id={`manufacturingDate-${index}`}
                          type="date"
                          value={item.manufacturingDate}
                          onChange={(e) => handleItemFieldChange(index, "manufacturingDate", e.target.value)}
                          required
                          className="h-10"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`expiryDate-${index}`}>Expiry Date (E_DT)*</Label>
                        <Input
                          id={`expiryDate-${index}`}
                          type="date"
                          value={item.expiryDate}
                          onChange={(e) => handleItemFieldChange(index, "expiryDate", e.target.value)}
                          required
                          className="h-10"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`invoiceNo-${index}`}>Invoice No (I_NO)*</Label>
                        <Input
                          id={`invoiceNo-${index}`}
                          type="text"
                          placeholder="e.g., INV-2024-001"
                          value={item.invoiceNo}
                          onChange={(e) => handleItemFieldChange(index, "invoiceNo", e.target.value)}
                          required
                          className="h-10"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`invoiceDate-${index}`}>Invoice Date (I_DT)*</Label>
                        <Input
                          id={`invoiceDate-${index}`}
                          type="date"
                          value={item.invoiceDate}
                          onChange={(e) => handleItemFieldChange(index, "invoiceDate", e.target.value)}
                          required
                          className="h-10"
                        />
                      </div>
                      <div className="space-y-2 flex items-end">
                        <Button
                          type="button"
                          onClick={() => generateQRCode(item, index)}
                          disabled={!item.manufacturingDate || !item.expiryDate || !item.invoiceNo || !item.invoiceDate}
                          className="w-full"
                        >
                          Generate QR Code
                        </Button>
                      </div>
                    </div>
                    
                    {qrCodeUrls[index] && (
                      <div className="mt-4 p-4 border rounded-lg bg-gray-50 flex flex-col items-center gap-3">
                        <p className="text-sm font-semibold">QR Code Generated:</p>
                        <img src={qrCodeUrls[index] || "/placeholder.svg"} alt="QR Code" className="w-48 h-48" />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handlePrintQRCode(index)}
                          className="w-full max-w-xs"
                        >
                          Print QR Code
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button type="submit" className="w-full" disabled={!selectedPoId || itemsToReceive.length === 0}>
            Record Goods Receipt
          </Button>
          {message && (
            <p className={`text-sm ${message.type === "success" ? "text-green-600" : "text-red-600"}`}>
              {message.text}
            </p>
          )}
          <BackToHomeButton onBack={onBack} className="w-full mt-2" />
        </CardFooter>
      </form>
    </Card>
  )
}
