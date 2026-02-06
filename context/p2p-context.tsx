"use client"

import { createContext, useContext, useState, type ReactNode, useCallback } from "react"
import { v4 as uuidv4 } from "uuid"

// --- Types ---
export interface PRItem {
  id: string
  itemCode: string
  itemDescription: string
  quantity: number
  unit: string
}

export interface PurchaseRequisition {
  id: string
  requestedBy: string
  status: "Pending" | "Approved" | "Rejected"
  items: PRItem[]
  createdAt: string
}

export interface POItem extends PRItem {
  prItemId?: string // Link to original PR item if applicable
  poQuantity: number // Quantity ordered in PO
  rate: number // New field: Rate per unit
  value: number // New field: Calculated Value (Rate * poQuantity)
  gstPercentage: number // New field: GST percentage
  gstAmount: number // New field: Calculated GST Amount (Value * GST%)
  totalAmount: number // New field: Calculated Total Amount (Value + GST Amt)
}

export interface PurchaseOrder {
  id: string
  prIds: string[] // IDs of linked PRs
  vendor: string
  status: "Pending" | "Approved" | "Rejected"
  items: POItem[]
  createdAt: string
}

export interface GRItem {
  id: string
  poItemId: string // Link to original PO item
  itemCode: string
  itemDescription: string
  receivedQuantity: number
  unit: string
  receivedAt: string
  manufacturingDate: string // Manufacturing Date (M_DT)
  expiryDate: string // Expiry Date (E_DT)
  invoiceNo: string // Invoice Number (I_NO)
  invoiceDate: string // Invoice Date (I_DT)
  qrCode?: string // Generated QR Code data
}

export interface StockItem {
  itemCode: string
  itemDescription: string
  unit: string
  currentStock: number
  totalValue: number // Total value of stock for weighted average calculation
  weightedAvgPrice: number // Weighted average price = totalValue / currentStock
}

interface GoodsReceipt {
  id: string
  poId: string
  items: GRItem[]
  createdAt: string
}

interface P2PContextType {
  purchaseRequisitions: PurchaseRequisition[]
  purchaseOrders: PurchaseOrder[]
  goodsReceipts: GoodsReceipt[]
  stock: StockItem[]
  createPR: (requestedBy: string, items: Omit<PRItem, "id">[]) => void
  approvePR: (id: string) => void
  rejectPR: (id: string) => void
  createPO: (prIds: string[], vendor: string, items: Omit<POItem, "id">[]) => void
  approvePO: (id: string) => void
  rejectPO: (id: string) => void
  createGR: (poId: string, items: Omit<GRItem, "id" | "receivedAt" | "qrCode">[]) => void
  issueItem: (itemCode: string, quantity: number) => void
}

const P2PContext = createContext<P2PContextType | undefined>(undefined)

export function P2PProvider({ children }: { children: ReactNode }) {
  const [purchaseRequisitions, setPurchaseRequisitions] = useState<PurchaseRequisition[]>([])
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([])
  const [goodsReceipts, setGoodsReceipts] = useState<GoodsReceipt[]>([])
  const [stock, setStock] = useState<StockItem[]>([])

  const createPR = useCallback((requestedBy: string, items: Omit<PRItem, "id">[]) => {
    const newPR: PurchaseRequisition = {
      id: uuidv4(),
      requestedBy,
      status: "Pending",
      items: items.map((item) => ({ ...item, id: uuidv4() })),
      createdAt: new Date().toISOString(),
    }
    setPurchaseRequisitions((prev) => [...prev, newPR])
    console.log("Created PR:", newPR)
  }, [])

  const approvePR = useCallback((id: string) => {
    setPurchaseRequisitions((prev) => prev.map((pr) => (pr.id === id ? { ...pr, status: "Approved" } : pr)))
    console.log(`Approved PR: ${id}`)
  }, [])

  const rejectPR = useCallback((id: string) => {
    setPurchaseRequisitions((prev) => prev.map((pr) => (pr.id === id ? { ...pr, status: "Rejected" } : pr)))
    console.log(`Rejected PR: ${id}`)
  }, [])

  const createPO = useCallback((prIds: string[], vendor: string, items: Omit<POItem, "id">[]) => {
    const newPO: PurchaseOrder = {
      id: uuidv4(),
      prIds,
      vendor,
      status: "Pending",
      items: items.map((item) => ({ ...item, id: uuidv4() })),
      createdAt: new Date().toISOString(),
    }
    setPurchaseOrders((prev) => [...prev, newPO])
    console.log("Created PO:", newPO)
  }, [])

  const approvePO = useCallback((id: string) => {
    setPurchaseOrders((prev) => prev.map((po) => (po.id === id ? { ...po, status: "Approved" } : po)))
    console.log(`Approved PO: ${id}`)
  }, [])

  const rejectPO = useCallback((id: string) => {
    setPurchaseOrders((prev) => prev.map((po) => (po.id === id ? { ...po, status: "Rejected" } : po)))
    console.log(`Rejected PO: ${id}`)
  }, [])

  const createGR = useCallback(
    (poId: string, items: Omit<GRItem, "id" | "receivedAt" | "qrCode">[]) => {
      const newGR: GoodsReceipt = {
        id: uuidv4(),
        poId,
        items: items.map((item) => {
          // Generate QR code data: Product+M_DT+E_DT+I_NO+I_DT
          const qrData = `${item.itemCode}|${item.manufacturingDate}|${item.expiryDate}|${item.invoiceNo}|${item.invoiceDate}`
          return { 
            ...item, 
            id: uuidv4(), 
            receivedAt: new Date().toISOString(),
            qrCode: qrData 
          }
        }),
        createdAt: new Date().toISOString(),
      }
      setGoodsReceipts((prev) => [...prev, newGR])

      // Update stock based on GR with weighted average calculation
      setStock((prevStock) => {
        const updatedStock = [...prevStock]
        newGR.items.forEach((grItem) => {
          // Find the PO and PO item to get the rate
          const po = purchaseOrders.find((p) => p.id === poId)
          const poItem = po?.items.find((item) => item.id === grItem.poItemId)
          const itemRate = poItem?.rate || 0

          const existingItemIndex = updatedStock.findIndex(
            (s) => s.itemCode === grItem.itemCode && s.unit === grItem.unit,
          )
          
          if (existingItemIndex > -1) {
            // Calculate new weighted average
            const existingItem = updatedStock[existingItemIndex]
            const newTotalValue = existingItem.totalValue + (grItem.receivedQuantity * itemRate)
            const newCurrentStock = existingItem.currentStock + grItem.receivedQuantity
            const newWeightedAvgPrice = newCurrentStock > 0 ? newTotalValue / newCurrentStock : 0

            updatedStock[existingItemIndex] = {
              ...existingItem,
              currentStock: newCurrentStock,
              totalValue: newTotalValue,
              weightedAvgPrice: newWeightedAvgPrice,
            }
          } else {
            // New stock item
            const totalValue = grItem.receivedQuantity * itemRate
            updatedStock.push({
              itemCode: grItem.itemCode,
              itemDescription: poItem?.itemDescription || grItem.itemDescription,
              unit: grItem.unit,
              currentStock: grItem.receivedQuantity,
              totalValue: totalValue,
              weightedAvgPrice: itemRate,
            })
          }
        })
        return updatedStock
      })
      console.log("Created GR:", newGR)
    },
    [purchaseOrders],
  ) // Depend on purchaseOrders to get item descriptions

  const issueItem = useCallback((itemCode: string, quantity: number) => {
    setStock((prevStock) => {
      const updatedStock = prevStock.map((item) => {
        if (item.itemCode === itemCode) {
          const newCurrentStock = Math.max(0, item.currentStock - quantity)
          // Reduce total value proportionally based on weighted avg price
          const valueReduction = quantity * item.weightedAvgPrice
          const newTotalValue = Math.max(0, item.totalValue - valueReduction)
          return {
            ...item,
            currentStock: newCurrentStock,
            totalValue: newTotalValue,
            // Weighted avg price remains the same after issue
          }
        }
        return item
      })
      console.log(
        `Issued ${quantity} of ${itemCode}. New stock:`,
        updatedStock.find((s) => s.itemCode === itemCode)?.currentStock,
      )
      return updatedStock
    })
  }, [])

  return (
    <P2PContext.Provider
      value={{
        purchaseRequisitions,
        purchaseOrders,
        goodsReceipts,
        stock,
        createPR,
        approvePR,
        rejectPR,
        createPO,
        approvePO,
        rejectPO,
        createGR,
        issueItem,
      }}
    >
      {children}
    </P2PContext.Provider>
  )
}

export function useP2P() {
  const context = useContext(P2PContext)
  if (context === undefined) {
    throw new Error("useP2P must be used within a P2PProvider")
  }
  return context
}
