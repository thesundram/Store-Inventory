"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import BackToHomeButton from "@/components/back-to-home-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { useP2P } from "@/context/p2p-context"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface IssueEntryScreenProps {
  onSuccess?: () => void
  onBack: () => void // Added onBack prop
}

export default function IssueEntryScreen({ onSuccess, onBack }: IssueEntryScreenProps) {
  const { issueItem, stock } = useP2P()
  const [selectedItemCode, setSelectedItemCode] = useState("")
  const [quantityToIssue, setQuantityToIssue] = useState(1)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const availableStockItems = stock.filter((item) => item.qaPassQty > 0)
  const selectedStockItem = stock.find((item) => item.itemCode === selectedItemCode)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedItemCode) {
      setMessage({ type: "error", text: "Please select an item to issue." })
      return
    }
    if (quantityToIssue <= 0) {
      setMessage({ type: "error", text: "Quantity to issue must be a positive number." })
      return
    }
    if (selectedStockItem && quantityToIssue > selectedStockItem.qaPassQty) {
      setMessage({ type: "error", text: `Cannot issue more than Quality Pass stock available (${selectedStockItem.qaPassQty}). Damaged stock cannot be issued.` })
      return
    }

    issueItem(selectedItemCode, quantityToIssue)
    setMessage({
      type: "success",
      text: `Successfully issued ${quantityToIssue} of ${selectedStockItem?.itemDescription}.`,
    })
    setSelectedItemCode("")
    setQuantityToIssue(1)
    if (onSuccess) {
      onSuccess()
    }
  }

  return (
    <Card className="w-full max-w-xl mx-auto">
      <CardHeader>
        <CardTitle>Issue Stock Entry</CardTitle>
        <CardDescription>Record the issuance of items from stock.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="itemSelect">Select Item</Label>
            <Select value={selectedItemCode} onValueChange={setSelectedItemCode}>
              <SelectTrigger id="itemSelect" className="h-10">
                {" "}
                {/* Added h-10 */}
                <SelectValue placeholder="Select an item from stock" />
              </SelectTrigger>
              <SelectContent>
                {availableStockItems.length === 0 && (
                  <p className="p-2 text-sm text-gray-500">No items in stock to issue.</p>
                )}
                {availableStockItems.map((item) => (
                  <SelectItem key={item.itemCode} value={item.itemCode}>
                    {item.itemCode} - {item.itemDescription} (QA Pass: {item.qaPassQty} {item.unit})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedStockItem && (
            <div className="space-y-4 bg-sky-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-100 p-3 rounded-md">
                  <p className="text-sm font-semibold text-green-700">Quality Pass Qty</p>
                  <p className="text-xl font-bold text-green-700">{selectedStockItem.qaPassQty.toFixed(2)} {selectedStockItem.unit}</p>
                </div>
                <div className="bg-red-100 p-3 rounded-md">
                  <p className="text-sm font-semibold text-red-700">Damaged Stock</p>
                  <p className="text-xl font-bold text-red-700">{selectedStockItem.damagedQty.toFixed(2)} {selectedStockItem.unit}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantityToIssue">Quantity to Issue (from Quality Pass Stock)</Label>
                <Input
                  id="quantityToIssue"
                  type="number"
                  placeholder="e.g., 10"
                  min="1"
                  max={selectedStockItem.qaPassQty}
                  value={quantityToIssue}
                  onChange={(e) => setQuantityToIssue(Number(e.target.value))}
                  required
                  className="h-10"
                />
                <p className="text-sm text-gray-600 font-semibold">
                  Available for issue: {selectedStockItem.qaPassQty} {selectedStockItem.unit}
                </p>
                <p className="text-xs text-red-600">
                  Note: Damaged stock ({selectedStockItem.damagedQty} {selectedStockItem.unit}) cannot be issued.
                </p>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button
            type="submit"
            className="w-full"
            disabled={
              !selectedItemCode ||
              quantityToIssue <= 0 ||
              (selectedStockItem && quantityToIssue > selectedStockItem.currentStock)
            }
          >
            Record Issue
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
