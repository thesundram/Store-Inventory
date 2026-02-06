"use server"

import { getSupabase } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

interface PurchaseRequisitionItem {
  itemCode: string
  itemDescription: string
  quantity: number
  unit: string
}

export async function createPurchaseRequisition(
  prevState: { success?: boolean; message?: string } | null,
  formData: FormData,
) {
  let supabase
  try {
    supabase = getSupabase()
  } catch (e: any) {
    return { success: false, message: e.message }
  }

  const requestedBy = formData.get("requestedBy") as string | null
  const itemsJson = formData.get("items") as string | null

  if (!requestedBy || !itemsJson) {
    return { success: false, message: "Requested By and at least one item are required." }
  }

  let items: PurchaseRequisitionItem[]
  try {
    items = JSON.parse(itemsJson)
    if (!Array.isArray(items) || items.length === 0) {
      return { success: false, message: "At least one item is required." }
    }
  } catch (e) {
    return { success: false, message: "Invalid items data format." }
  }

  // Validate each item
  for (const item of items) {
    if (!item.itemCode || !item.itemDescription || !item.unit || isNaN(item.quantity) || item.quantity <= 0) {
      return { success: false, message: "All item fields must be filled and quantity must be a positive number." }
    }
  }

  // 1. Insert the main Purchase Requisition header
  const { data: prData, error: prError } = await supabase
    .from("purchase_requisitions")
    .insert({
      requested_by: requestedBy,
      status: "Pending",
    })
    .select("id") // Select the ID to link items
    .single()

  if (prError || !prData) {
    console.error("Error creating purchase requisition header:", prError)
    return { success: false, message: prError?.message || "Failed to create purchase requisition header." }
  }

  const prId = prData.id

  // 2. Prepare items for insertion
  const itemsToInsert = items.map((item) => ({
    pr_id: prId,
    item_code: item.itemCode,
    item_description: item.itemDescription,
    quantity: item.quantity,
    unit: item.unit,
  }))

  // 3. Insert the purchase requisition items
  const { error: itemsError } = await supabase.from("purchase_requisition_items").insert(itemsToInsert)

  if (itemsError) {
    console.error("Error creating purchase requisition items:", itemsError)
    // Optionally, you might want to delete the PR header if item insertion fails
    // await supabase.from("purchase_requisitions").delete().eq("id", prId);
    return { success: false, message: itemsError.message || "Failed to create purchase requisition items." }
  }

  revalidatePath("/")
  return { success: true, message: "Purchase Requisition created successfully!" }
}
