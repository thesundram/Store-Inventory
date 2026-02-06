"use client"

import { useActionState, useState } from "react"
import { createPurchaseRequisition } from "@/app/actions/pr-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { PlusIcon, TrashIcon } from "lucide-react"

interface PurchaseRequisitionItem {
  id: number // Used for unique key in React list
  itemCode: string
  itemDescription: string
  quantity: number
  unit: string
}

export default function PurchaseRequisitionForm() {
  const [state, action, isPending] = useActionState(createPurchaseRequisition, null)
  const [items, setItems] = useState<PurchaseRequisitionItem[]>([
    { id: Date.now(), itemCode: "", itemDescription: "", quantity: 1, unit: "" },
  ])

  const handleAddItem = () => {
    setItems([...items, { id: Date.now(), itemCode: "", itemDescription: "", quantity: 1, unit: "" }])
  }

  const handleRemoveItem = (idToRemove: number) => {
    setItems(items.filter((item) => item.id !== idToRemove))
  }

  const handleItemChange = (id: number, field: keyof Omit<PurchaseRequisitionItem, "id">, value: string | number) => {
    setItems(items.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create Purchase Requisition</CardTitle>
        <CardDescription>Fill in the details for your new purchase request, including multiple items.</CardDescription>
      </CardHeader>
      <form action={action}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="requestedBy">Requested By</Label>
            <Input id="requestedBy" name="requestedBy" type="text" placeholder="Your Name or Department" required />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Items</h3>
            {items.map((item, index) => (
              <div
                key={item.id}
                className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end border-b pb-4 last:border-b-0"
              >
                <div className="space-y-2 col-span-1">
                  <Label htmlFor={`itemCode-${item.id}`}>Item Code</Label>
                  <Input
                    id={`itemCode-${item.id}`}
                    type="text"
                    placeholder="e.g., ABC-123"
                    value={item.itemCode}
                    onChange={(e) => handleItemChange(item.id, "itemCode", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor={`itemDescription-${item.id}`}>Item Description</Label>
                  <Textarea
                    id={`itemDescription-${item.id}`}
                    placeholder="e.g., 100 units of XYZ component"
                    value={item.itemDescription}
                    onChange={(e) => handleItemChange(item.id, "itemDescription", e.target.value)}
                    required
                    className="min-h-[40px]"
                  />
                </div>
                <div className="space-y-2 col-span-1">
                  <Label htmlFor={`quantity-${item.id}`}>Quantity</Label>
                  <Input
                    id={`quantity-${item.id}`}
                    type="number"
                    placeholder="e.g., 100"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(item.id, "quantity", Number(e.target.value))}
                    required
                  />
                </div>
                <div className="space-y-2 col-span-1 flex items-end gap-2">
                  <div className="flex-grow">
                    <Label htmlFor={`unit-${item.id}`}>Unit</Label>
                    <Input
                      id={`unit-${item.id}`}
                      type="text"
                      placeholder="e.g., Pcs, Kg"
                      value={item.unit}
                      onChange={(e) => handleItemChange(item.id, "unit", e.target.value)}
                      required
                    />
                  </div>
                  {items.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => handleRemoveItem(item.id)}
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
          <input type="hidden" name="items" value={JSON.stringify(items)} />
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Submitting..." : "Submit Requisition"}
          </Button>
          {state && state.message && (
            <p className={`text-sm ${state.success ? "text-green-600" : "text-red-600"}`}>{state.message}</p>
          )}
        </CardFooter>
      </form>
    </Card>
  )
}
