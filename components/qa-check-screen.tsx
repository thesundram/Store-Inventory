"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import BackToHomeButton from "@/components/back-to-home-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useP2P } from "@/context/p2p-context"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"

interface QACheckScreenProps {
  onBack: () => void
}

export default function QACheckScreen({ onBack }: QACheckScreenProps) {
  const { goodsReceipts, updateStockFromQACheck } = useP2P()
  const [selectedLotNo, setSelectedLotNo] = useState<string>("")
  const [qaPass, setQaPass] = useState<number>(0)
  const [qaFailDamage, setQaFailDamage] = useState<number>(0)
  const [qcFailShelfLife, setQcFailShelfLife] = useState<number>(0)
  const [qcFailExpiry, setQcFailExpiry] = useState<number>(0)
  const [generalRemark, setGeneralRemark] = useState<string>("")
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [qaRecords, setQaRecords] = useState<
    Array<{
      lotNo: string
      itemCode: string
      itemDescription: string
      lotQty: number
      unit: string
      qaPass: number
      qaFailDamage: number
      qcFailShelfLife: number
      qcFailExpiry: number
      generalRemark: string
      checkDate: string
    }>
  >([])

  // Get all lots that haven't been QA checked yet
  const allGRItems = goodsReceipts.flatMap((gr) =>
    gr.items.map((item) => ({
      ...item,
      grId: gr.id,
    })),
  )

  const uncheckedLots = allGRItems.filter(
    (item) => !qaRecords.some((record) => record.lotNo === item.lotNo),
  )

  const selectedLot = uncheckedLots.find((item) => item.lotNo === selectedLotNo)
  const totalQty = qaPass + qaFailDamage + qcFailShelfLife + qcFailExpiry
  const isValid = selectedLot && totalQty === selectedLot.receivedQuantity
  const isQtyMismatch = selectedLot && totalQty > 0 && totalQty !== selectedLot.receivedQuantity

  const handleQASubmit = () => {
    if (!selectedLotNo) {
      setMessage({ type: "error", text: "Please select a Lot No" })
      return
    }

    if (!selectedLot) {
      setMessage({ type: "error", text: "Selected lot not found" })
      return
    }

    if (totalQty !== selectedLot.receivedQuantity) {
      setMessage({
        type: "error",
        text: `Total Qty (${totalQty}) must equal Lot Qty (${selectedLot.receivedQuantity})`,
      })
      return
    }

    if (!generalRemark.trim()) {
      setMessage({ type: "error", text: "Please enter a General Remark" })
      return
    }

    const qaRecord = {
      lotNo: selectedLot.lotNo,
      itemCode: selectedLot.itemCode,
      itemDescription: selectedLot.itemDescription,
      lotQty: selectedLot.receivedQuantity,
      unit: selectedLot.unit,
      qaPass,
      qaFailDamage,
      qcFailShelfLife,
      qcFailExpiry,
      generalRemark,
      checkDate: new Date().toISOString().split("T")[0],
    }

    setQaRecords([...qaRecords, qaRecord])
    
    // Update stock based on QA check results
    updateStockFromQACheck(selectedLot.lotNo, qaPass, qaFailDamage, qcFailShelfLife, qcFailExpiry)
    
    setMessage({ type: "success", text: `QA Check completed for Lot ${selectedLot.lotNo}` })

    // Reset form
    setSelectedLotNo("")
    setQaPass(0)
    setQaFailDamage(0)
    setQcFailShelfLife(0)
    setQcFailExpiry(0)
    setGeneralRemark("")
  }

  return (
    <Card className="w-full max-w-6xl">
      <CardHeader className="bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-t-lg py-6">
        <CardTitle>QA Check</CardTitle>
        <CardDescription className="text-blue-100">
          Verify and validate received goods against quality standards
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* QA Check Form */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Quality Assurance Inspection</h3>

          {/* Lot Selection */}
          <div className="space-y-2">
            <Label htmlFor="lot-select">Select Lot No (Not Yet QA Passed)*</Label>
            <Select value={selectedLotNo} onValueChange={setSelectedLotNo}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select a Lot No to inspect" />
              </SelectTrigger>
              <SelectContent>
                {uncheckedLots.length === 0 ? (
                  <SelectItem value="no-lots" disabled>
                    All lots completed QA check
                  </SelectItem>
                ) : (
                  uncheckedLots.map((item) => (
                    <SelectItem key={item.lotNo} value={item.lotNo}>
                      {item.lotNo} - {item.itemCode} ({item.receivedQuantity} {item.unit})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Selected Lot Details */}
          {selectedLot && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 font-medium">Lot No</p>
                  <p className="font-semibold text-gray-900">{selectedLot.lotNo}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-medium">Item Code</p>
                  <p className="font-semibold text-gray-900">{selectedLot.itemCode}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-medium">Lot Qty</p>
                  <p className="font-semibold text-gray-900">
                    {selectedLot.receivedQuantity} {selectedLot.unit}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 font-medium">Total Entered</p>
                  <p className={`font-semibold ${totalQty === selectedLot.receivedQuantity ? "text-green-700" : "text-red-700"}`}>
                    {totalQty} {selectedLot.unit}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* QA Check Quantities */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="qa-pass">QA Pass (Qty)*</Label>
              <Input
                id="qa-pass"
                type="number"
                placeholder="0"
                min="0"
                step="0.01"
                value={qaPass || ""}
                onChange={(e) => setQaPass(Number(e.target.value) || 0)}
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="qa-fail-damage">QA Fail - Damage (Qty)*</Label>
              <Input
                id="qa-fail-damage"
                type="number"
                placeholder="0"
                min="0"
                step="0.01"
                value={qaFailDamage || ""}
                onChange={(e) => setQaFailDamage(Number(e.target.value) || 0)}
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="qc-fail-shelf">QC Fail - Shelf Life (Qty)*</Label>
              <Input
                id="qc-fail-shelf"
                type="number"
                placeholder="0"
                min="0"
                step="0.01"
                value={qcFailShelfLife || ""}
                onChange={(e) => setQcFailShelfLife(Number(e.target.value) || 0)}
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="qc-fail-expiry">QC Fail - Expiry (Qty)*</Label>
              <Input
                id="qc-fail-expiry"
                type="number"
                placeholder="0"
                min="0"
                step="0.01"
                value={qcFailExpiry || ""}
                onChange={(e) => setQcFailExpiry(Number(e.target.value) || 0)}
                className="h-10"
              />
            </div>
          </div>

          {/* Validation Message */}
          {selectedLot && totalQty > 0 && isQtyMismatch && (
            <div className="p-3 bg-red-50 border border-red-300 rounded-lg">
              <p className="text-sm text-red-700">
                <span className="font-semibold">Validation Error:</span> Total quantity ({totalQty}) must equal
                Lot quantity ({selectedLot.receivedQuantity})
              </p>
            </div>
          )}

          {/* General Remark */}
          <div className="space-y-2">
            <Label htmlFor="general-remark">General Remark*</Label>
            <textarea
              id="general-remark"
              placeholder="Enter QA inspection notes, observations, or reasons for failures..."
              value={generalRemark}
              onChange={(e) => setGeneralRemark(e.target.value)}
              rows={3}
              className="w-full p-2 border border-gray-300 rounded-lg h-20 text-sm font-sans"
            />
          </div>

          {/* Message */}
          {message && (
            <p className={`text-sm font-medium ${message.type === "success" ? "text-green-600" : "text-red-600"}`}>
              {message.text}
            </p>
          )}

          {/* Submit Button */}
          <Button
            onClick={handleQASubmit}
            disabled={!selectedLot || !isValid}
            className="w-full bg-sky-600 hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Complete QA Check
          </Button>
        </div>

        {/* QA Records Table */}
        {qaRecords.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">QA Check History</h3>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lot No</TableHead>
                    <TableHead>Item Code</TableHead>
                    <TableHead className="text-right">Lot Qty</TableHead>
                    <TableHead className="text-right">QA Pass</TableHead>
                    <TableHead className="text-right">Fail - Damage</TableHead>
                    <TableHead className="text-right">Fail - Shelf Life</TableHead>
                    <TableHead className="text-right">Fail - Expiry</TableHead>
                    <TableHead>Remark</TableHead>
                    <TableHead>Check Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {qaRecords.map((record, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-mono text-sm">{record.lotNo}</TableCell>
                      <TableCell className="font-medium">{record.itemCode}</TableCell>
                      <TableCell className="text-right">
                        {record.lotQty} {record.unit}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-semibold">
                          {record.qaPass}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-semibold">
                          {record.qaFailDamage}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm font-semibold">
                          {record.qcFailShelfLife}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm font-semibold">
                          {record.qcFailExpiry}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600 max-w-xs truncate">{record.generalRemark}</TableCell>
                      <TableCell className="text-sm">{record.checkDate}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <BackToHomeButton onBack={onBack} />
      </CardFooter>
    </Card>
  )
}
