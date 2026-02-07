"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import BackToHomeButton from "@/components/back-to-home-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { PlusIcon, TrashIcon } from "lucide-react"
import { useP2P, type POItem, type PurchaseRequisition } from "@/context/p2p-context"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ALPHABET_ITEM_CODES, UNIT_OPTIONS, ITEM_CODE_DESCRIPTIONS, VENDOR_OPTIONS } from "@/lib/constants"
import { numberToWords } from "@/utils/numberToWords"

interface PoCreationScreenProps {
  onSuccess?: () => void
  onBack: () => void
  selectedPrForPo?: PurchaseRequisition | null
}

export default function PoCreationScreen({ onSuccess, onBack, selectedPrForPo }: PoCreationScreenProps) {
  const { createPO, purchaseRequisitions } = useP2P()
  const [vendor, setVendor] = useState("")
  const [selectedPrId, setSelectedPrId] = useState<string>(selectedPrForPo?.id || "")
  const [items, setItems] = useState<Omit<POItem, "id">[]>(
    selectedPrForPo
      ? selectedPrForPo.items.map((prItem) => ({
          itemCode: prItem.itemCode,
          itemDescription: ITEM_CODE_DESCRIPTIONS[prItem.itemCode] || prItem.itemDescription,
          quantity: prItem.quantity, // Original PR quantity
          unit: prItem.unit,
          prItemId: prItem.id,
          poQuantity: prItem.quantity, // Default PO quantity to PR quantity
          rate: 0, // Initialize new fields
          value: 0,
          gstPercentage: 0,
          gstAmount: 0,
          totalAmount: 0,
        }))
      : [
          {
            itemCode: "",
            itemDescription: "",
            quantity: 1,
            unit: "",
            poQuantity: 1,
            rate: 0,
            value: 0,
            gstPercentage: 0,
            gstAmount: 0,
            totalAmount: 0,
          },
        ],
  )
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [pageTotalValue, setPageTotalValue] = useState(0)
  const [pageTotalGstAmount, setPageTotalGstAmount] = useState(0)
  const [pageTotalTotalAmount, setPageTotalTotalAmount] = useState(0)
  const [discountAmount, setDiscountAmount] = useState(0)
  const [grandTotal, setGrandTotal] = useState(0)
  const [grandTotalInWords, setGrandTotalInWords] = useState("")

  const availablePRs = purchaseRequisitions.filter((pr) => pr.status === "Pending" || pr.status === "Approved")
  const currentSelectedPR = availablePRs.find((pr) => pr.id === selectedPrId)

  useEffect(() => {
    if (currentSelectedPR) {
      setItems(
        currentSelectedPR.items.map((prItem) => {
          const initialRate = 0
          const initialPoQuantity = prItem.quantity
          const initialGstPercentage = 0

          const calculatedValue = initialRate * initialPoQuantity
          const calculatedGstAmount = calculatedValue * (initialGstPercentage / 100)
          const calculatedTotalAmount = calculatedValue + calculatedGstAmount

          return {
            itemCode: prItem.itemCode,
            itemDescription: ITEM_CODE_DESCRIPTIONS[prItem.itemCode] || prItem.itemDescription,
            quantity: prItem.quantity,
            unit: prItem.unit,
            prItemId: prItem.id,
            poQuantity: initialPoQuantity,
            rate: initialRate,
            value: calculatedValue,
            gstPercentage: initialGstPercentage,
            gstAmount: calculatedGstAmount,
            totalAmount: calculatedTotalAmount,
          }
        }),
      )
    } else {
      setItems([
        {
          itemCode: "",
          itemDescription: "",
          quantity: 1,
          unit: "",
          poQuantity: 1,
          rate: 0,
          value: 0,
          gstPercentage: 0,
          gstAmount: 0,
          totalAmount: 0,
        },
      ])
    }
  }, [selectedPrId, currentSelectedPR])

  useEffect(() => {
    const totalValue = items.reduce((sum, item) => sum + item.value, 0)
    const totalGstAmount = items.reduce((sum, item) => sum + item.gstAmount, 0)
    const totalTotalAmount = items.reduce((sum, item) => sum + item.totalAmount, 0)

    setPageTotalValue(totalValue)
    setPageTotalGstAmount(totalGstAmount)
    setPageTotalTotalAmount(totalTotalAmount)
  }, [items])

  // Calculate Grand Total and convert to words, rounding up
  useEffect(() => {
    const calculatedGrandTotal = Math.ceil(pageTotalTotalAmount - discountAmount) // Round up here
    setGrandTotal(calculatedGrandTotal)
    setGrandTotalInWords(numberToWords(calculatedGrandTotal))
  }, [pageTotalTotalAmount, discountAmount])

  const calculateItemAmounts = (item: Omit<POItem, "id">) => {
    const rate = item.rate || 0
    const poQuantity = item.poQuantity || 0
    const gstPercentage = item.gstPercentage || 0

    const value = rate * poQuantity
    const gstAmount = value * (gstPercentage / 100)
    const totalAmount = value + gstAmount

    return { value, gstAmount, totalAmount }
  }

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        itemCode: "",
        itemDescription: "",
        quantity: 1,
        unit: "",
        poQuantity: 1,
        rate: 0,
        value: 0,
        gstPercentage: 0,
        gstAmount: 0,
        totalAmount: 0,
      },
    ])
  }

  const handleRemoveItem = (indexToRemove: number) => {
    setItems(items.filter((_, index) => index !== indexToRemove))
  }

  const handleItemChange = (index: number, field: keyof Omit<POItem, "id">, value: string | number) => {
    setItems((prevItems) =>
      prevItems.map((item, i) => {
        if (i === index) {
          let updatedItem = { ...item, [field]: value } as Omit<POItem, "id">

          // If itemCode changes, update itemDescription
          if (field === "itemCode" && typeof value === "string") {
            updatedItem.itemDescription = ITEM_CODE_DESCRIPTIONS[value] || ""
          }

          // Recalculate dependent fields if rate, quantity, or GST% changes
          if (field === "rate" || field === "poQuantity" || field === "gstPercentage") {
            const {
              value: newValue,
              gstAmount: newGstAmount,
              totalAmount: newTotalAmount,
            } = calculateItemAmounts(updatedItem)
            updatedItem = {
              ...updatedItem,
              value: newValue,
              gstAmount: newGstAmount,
              totalAmount: newTotalAmount,
            }
          }
          return updatedItem
        }
        return item
      }),
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!vendor.trim()) {
      setMessage({ type: "error", text: "Vendor is required." })
      return
    }
    if (!selectedPrId) {
      setMessage({ type: "error", text: "Please select a Purchase Requisition." })
      return
    }
    if (items.length === 0) {
      setMessage({ type: "error", text: "At least one item is required." })
      return
    }
    for (const item of items) {
      if (
        !item.itemCode.trim() ||
        !item.itemDescription.trim() ||
        !item.unit.trim() ||
        item.poQuantity <= 0 ||
        item.rate < 0 ||
        item.gstPercentage < 0
      ) {
        setMessage({
          type: "error",
          text: "All item fields must be filled, quantities/rates must be positive numbers, and GST% cannot be negative.",
        })
        return
      }
    }
    if (discountAmount < 0) {
      setMessage({ type: "error", text: "Discount amount cannot be negative." })
      return
    }
    if (grandTotal < 0) {
      setMessage({ type: "error", text: "Grand Total cannot be negative. Adjust discount or item values." })
      return
    }

    createPO([selectedPrId], vendor, items)
    setMessage({ type: "success", text: "Purchase Order created successfully!" })
    setVendor("")
    setSelectedPrId("")
    setItems([
      {
        itemCode: "",
        itemDescription: "",
        quantity: 1,
        unit: "",
        poQuantity: 1,
        rate: 0,
        value: 0,
        gstPercentage: 0,
        gstAmount: 0,
        totalAmount: 0,
      },
    ])
    setDiscountAmount(0)
    if (onSuccess) {
      onSuccess()
    }
  }

  return (
    <Card className="w-full max-w-5xl mx-auto">
      <CardHeader>
        <CardTitle>Create Purchase Order</CardTitle>
        <CardDescription>Generate a new Purchase Order by selecting an open or approved PR.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="vendor">Vendor</Label>
            <Select value={vendor} onValueChange={setVendor} required>
              <SelectTrigger id="vendor" className="h-10">
                <SelectValue placeholder="Select Vendor" />
              </SelectTrigger>
              <SelectContent>
                {VENDOR_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="prSelect">Select Purchase Requisition</Label>
            <Select value={selectedPrId} onValueChange={setSelectedPrId} required>
              <SelectTrigger id="prSelect" className="h-10">
                <SelectValue placeholder="Select an open or approved PR" />
              </SelectTrigger>
              <SelectContent>
                {availablePRs.length === 0 && (
                  <p className="p-2 text-sm text-gray-500">No open or approved PRs available.</p>
                )}
                {availablePRs.map((pr) => (
                  <SelectItem key={pr.id} value={pr.id}>
                    PR: {pr.id.substring(0, 8)}... ({pr.requestedBy} - {pr.status})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Items for PO</h3>
            {items.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-10 gap-4 items-end border-b pb-4 last:border-b-0"
              >
                <div className="space-y-2 col-span-1">
                  <Label htmlFor={`po-itemCode-${index}`}>Item Code</Label>
                  <Select
                    value={item.itemCode}
                    onValueChange={(value) => handleItemChange(index, "itemCode", value)}
                    required
                  >
                    <SelectTrigger id={`po-itemCode-${index}`} className="h-10">
                      <SelectValue placeholder="Code" />
                    </SelectTrigger>
                    <SelectContent>
                      {ALPHABET_ITEM_CODES.map((code) => (
                        <SelectItem key={code} value={code}>
                          {code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor={`po-itemDescription-${index}`}>Item Description</Label>
                  <Textarea
                    id={`po-itemDescription-${index}`}
                    placeholder="Description"
                    value={item.itemDescription}
                    readOnly
                    className="h-10 bg-gray-100 cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2 col-span-1">
                  <Label htmlFor={`po-quantity-${index}`}>PO Qty</Label>
                  <Input
                    id={`po-quantity-${index}`}
                    type="number"
                    placeholder="Qty"
                    min="0.01"
                    step="0.01"
                    max="99999999.99"
                    value={item.poQuantity}
                    onChange={(e) => handleItemChange(index, "poQuantity", Number(e.target.value))}
                    required
                    className="h-10"
                  />
                </div>
                <div className="space-y-2 col-span-1">
                  <Label htmlFor={`po-unit-${index}`}>Unit</Label>
                  <Select value={item.unit} onValueChange={(value) => handleItemChange(index, "unit", value)} required>
                    <SelectTrigger id={`po-unit-${index}`} className="h-10">
                      <SelectValue placeholder="Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {UNIT_OPTIONS.map((unit) => (
                        <SelectItem key={unit} value={unit}>
                          {unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 col-span-1">
                  <Label htmlFor={`po-rate-${index}`}>Rate</Label>
                  <Input
                    id={`po-rate-${index}`}
                    type="number"
                    placeholder="Rate"
                    min="0"
                    step="0.01"
                    max="99999999.99"
                    value={item.rate}
                    onChange={(e) => handleItemChange(index, "rate", Number(e.target.value))}
                    required
                    className="h-10"
                  />
                </div>
                <div className="space-y-2 col-span-1">
                  <Label htmlFor={`po-value-${index}`}>Value</Label>
                  <Input
                    id={`po-value-${index}`}
                    type="number"
                    value={item.value.toFixed(2)}
                    readOnly
                    className="h-10 bg-gray-100 cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2 col-span-1">
                  <Label htmlFor={`po-gst-percent-${index}`}>GST%</Label>
                  <Input
                    id={`po-gst-percent-${index}`}
                    type="number"
                    placeholder="GST%"
                    min="0"
                    step="0.01"
                    max="99999999.99"
                    value={item.gstPercentage}
                    onChange={(e) => handleItemChange(index, "gstPercentage", Number(e.target.value))}
                    required
                    className="h-10"
                  />
                </div>
                <div className="space-y-2 col-span-1">
                  <Label htmlFor={`po-gst-amount-${index}`}>GST Amt</Label>
                  <Input
                    id={`po-gst-amount-${index}`}
                    type="number"
                    value={item.gstAmount.toFixed(2)}
                    readOnly
                    className="h-10 bg-gray-100 cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2 col-span-1 flex items-end gap-2">
                  <div className="flex-grow">
                    <Label htmlFor={`po-total-amount-${index}`}>Total Amt</Label>
                    <Input
                      id={`po-total-amount-${index}`}
                      type="number"
                      value={item.totalAmount.toFixed(2)}
                      readOnly
                      className="h-10 bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                  {items.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => handleRemoveItem(index)}
                      aria-label="Remove item"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={handleAddItem} className="w-full bg-transparent">
              <PlusIcon className="mr-2 h-4 w-4" /> Add Item
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-10 gap-4 items-end pt-4 border-t mt-6">
            <div className="col-span-7 text-right font-semibold">Page Totals:</div>
            <div className="col-span-1 text-right font-semibold">
              <Label>Value</Label>
              <Input
                type="number"
                value={pageTotalValue.toFixed(2)}
                readOnly
                className="h-10 bg-gray-100 cursor-not-allowed text-right font-bold"
              />
            </div>
            <div className="col-span-1 text-right font-semibold">
              <Label>GST Amt</Label>
              <Input
                type="number"
                value={pageTotalGstAmount.toFixed(2)}
                readOnly
                className="h-10 bg-gray-100 cursor-not-allowed text-right font-bold"
              />
            </div>
            <div className="col-span-1 text-right font-semibold">
              <Label>Total Amt</Label>
              <Input
                type="number"
                value={pageTotalTotalAmount.toFixed(2)}
                readOnly
                className="h-10 bg-gray-100 cursor-not-allowed text-right font-bold"
              />
            </div>
          </div>
          {/* Discount and Grand Total fields */}
          <div className="grid grid-cols-1 md:grid-cols-10 gap-4 items-end pt-4 border-t">
            <div className="col-span-7"></div> {/* Empty space to align */}
            <div className="col-span-1 text-right font-semibold">
              <Label htmlFor="discountAmount">Discount</Label>
              <Input
                id="discountAmount"
                type="number"
                placeholder="0.00"
                min="0"
                step="0.01"
                max="99999999.99"
                value={discountAmount}
                onChange={(e) => setDiscountAmount(Number(e.target.value))}
                className="h-10 text-right"
              />
            </div>
            <div className="col-span-1 text-right font-semibold">{/* Empty space for GST Amt column */}</div>
            <div className="col-span-1 text-right font-semibold">
              <Label>Grand Total</Label>
              <Input
                type="number"
                value={grandTotal.toFixed(2)} // Display with 2 decimal places
                readOnly
                className="h-10 bg-gray-100 cursor-not-allowed text-right font-bold"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          {/* Grand Total in words */}
          <div className="w-full text-center text-lg font-semibold text-gray-700 mb-4">
            Grand Total in Words: <span className="text-blue-600">{grandTotalInWords}</span>
          </div>
          <Button type="submit" className="w-full">
            Create Purchase Order
          </Button>
          {message && (
            <p className={`text-sm ${message.type === "success" ? "text-green-600" : "text-red-600"}`}>
              {message.text}
            </p>
          )}
          <Button onClick={onBack} className="w-full mt-2 bg-green-100 text-green-800 hover:bg-green-200">
            Back to Main Menu
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
