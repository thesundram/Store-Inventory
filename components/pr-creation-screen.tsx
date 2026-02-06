"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import BackToHomeButton from "@/components/back-to-home-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { PlusIcon, TrashIcon } from "lucide-react"
import { useP2P, type PRItem } from "@/context/p2p-context"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ALPHABET_ITEM_CODES, UNIT_OPTIONS, ITEM_CODE_DESCRIPTIONS } from "@/lib/constants"

interface PrCreationScreenProps {
  onSuccess: () => void
  onBack: () => void // Added onBack prop
}

export default function PrCreationScreen({ onSuccess, onBack }: PrCreationScreenProps) {
  const { createPR } = useP2P()
  const [requestedBy, setRequestedBy] = useState("")
  const [items, setItems] = useState<Omit<PRItem, "id">[]>([
    { itemCode: "", itemDescription: "", quantity: 1, unit: "" },
  ])
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleAddItem = () => {
    setItems([...items, { itemCode: "", itemDescription: "", quantity: 1, unit: "" }])
  }

  const handleRemoveItem = (indexToRemove: number) => {
    setItems(items.filter((_, index) => index !== indexToRemove))
  }

  const handleItemChange = (index: number, field: keyof Omit<PRItem, "id">, value: string | number) => {
    setItems((prevItems) =>
      prevItems.map((item, i) => {
        if (i === index) {
          const updatedItem = { ...item, [field]: value }
          // If itemCode changes, update itemDescription
          if (field === "itemCode" && typeof value === "string") {
            updatedItem.itemDescription = ITEM_CODE_DESCRIPTIONS[value] || ""
          }
          return updatedItem
        }
        return item
      }),
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!requestedBy.trim()) {
      setMessage({ type: "error", text: "Requested By is required." })
      return
    }
    if (items.length === 0) {
      setMessage({ type: "error", text: "At least one item is required." })
      return
    }
    for (const item of items) {
      if (!item.itemCode.trim() || !item.itemDescription.trim() || !item.unit.trim() || item.quantity <= 0) {
        setMessage({ type: "error", text: "All item fields must be filled and quantity must be a positive number." })
        return
      }
    }

    createPR(requestedBy, items)
    setMessage({ type: "success", text: "Purchase Requisition created successfully!" })
    setRequestedBy("")
    setItems([{ itemCode: "", itemDescription: "", quantity: 1, unit: "" }])
    onSuccess()
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create Purchase Requisition</CardTitle>
        <CardDescription>Fill in the details for your new purchase request, including multiple items.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="requestedBy">Requested By</Label>
            <Input
              id="requestedBy"
              type="text"
              placeholder="Your Name or Department"
              value={requestedBy}
              onChange={(e) => setRequestedBy(e.target.value)}
              required
              className="h-10"
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Items</h3>
            {items.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end border-b pb-4 last:border-b-0"
              >
                <div className="space-y-2 col-span-1">
                  <Label htmlFor={`itemCode-${index}`}>Item Code</Label>
                  <Select
                    value={item.itemCode}
                    onValueChange={(value) => handleItemChange(index, "itemCode", value)}
                    required
                  >
                    <SelectTrigger id={`itemCode-${index}`} className="h-10">
                      <SelectValue placeholder="Select Code" />
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
                  <Label htmlFor={`itemDescription-${index}`}>Item Description</Label>
                  <Textarea
                    id={`itemDescription-${index}`}
                    placeholder="e.g., 100 units of XYZ component"
                    value={item.itemDescription}
                    readOnly
                    className="h-10 bg-gray-100 cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2 col-span-1">
                  <Label htmlFor={`quantity-${index}`}>Quantity</Label>
                  <Input
                    id={`quantity-${index}`}
                    type="number"
                    placeholder="e.g., 100"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, "quantity", Number(e.target.value))}
                    required
                    className="h-10"
                  />
                </div>
                <div className="space-y-2 col-span-1 flex items-end gap-2">
                  <div className="flex-grow">
                    <Label htmlFor={`unit-${index}`}>Unit</Label>
                    <Select
                      value={item.unit}
                      onValueChange={(value) => handleItemChange(index, "unit", value)}
                      required
                    >
                      <SelectTrigger id={`unit-${index}`} className="h-10">
                        <SelectValue placeholder="Select Unit" />
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
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button type="submit" className="w-full">
            Submit Requisition
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
