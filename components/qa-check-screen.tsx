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
  const { goodsReceipts } = useP2P()
  const [selectedGrId, setSelectedGrId] = useState<string>("")
  const [qaStatus, setQaStatus] = useState<"Pending" | "Passed" | "Failed">("Pending")
  const [qaComments, setQaComments] = useState<string>("")
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [qaRecords, setQaRecords] = useState<
    Array<{
      grId: string
      grItemCount: number
      qaStatus: "Pending" | "Passed" | "Failed"
      qaDate: string
      qaComments: string
    }>
  >([])

  const selectedGR = goodsReceipts.find((gr) => gr.id === selectedGrId)

  const handleQASubmit = () => {
    if (!selectedGrId || !qaStatus) {
      setMessage({ type: "error", text: "Please select a GR and QA Status" })
      return
    }

    const qaRecord = {
      grId: selectedGrId,
      grItemCount: selectedGR?.items.length || 0,
      qaStatus,
      qaDate: new Date().toISOString().split("T")[0],
      qaComments,
    }

    setQaRecords([...qaRecords, qaRecord])
    setMessage({ type: "success", text: `QA Check completed for GR ${selectedGrId.substring(0, 8)}...` })
    setSelectedGrId("")
    setQaStatus("Pending")
    setQaComments("")
  }

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader className="bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-t-lg py-6">
        <CardTitle>QA Check</CardTitle>
        <CardDescription className="text-blue-100">
          Verify and validate received goods against quality standards
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* QA Check Form */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">QA Inspection Details</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gr-select">Select Goods Receipt*</Label>
              <Select value={selectedGrId} onValueChange={setSelectedGrId}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select a GR to inspect" />
                </SelectTrigger>
                <SelectContent>
                  {goodsReceipts.map((gr) => (
                    <SelectItem key={gr.id} value={gr.id}>
                      GR {gr.id.substring(0, 8)}... ({gr.items.length} items)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="qa-status">QA Status*</Label>
              <Select value={qaStatus} onValueChange={(value) => setQaStatus(value as any)}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select QA status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Passed">Passed</SelectItem>
                  <SelectItem value="Failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="qa-comments">QA Comments</Label>
            <textarea
              id="qa-comments"
              placeholder="Enter QA inspection notes, observations, or reasons for failure..."
              value={qaComments}
              onChange={(e) => setQaComments(e.target.value)}
              rows={4}
              className="w-full p-2 border border-gray-300 rounded-lg h-24 text-sm"
            />
          </div>

          {selectedGR && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold mb-2">Selected GR Details:</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                <div>
                  <p className="text-gray-600">Items</p>
                  <p className="font-semibold">{selectedGR.items.length}</p>
                </div>
                <div>
                  <p className="text-gray-600">Total Qty</p>
                  <p className="font-semibold">
                    {selectedGR.items.reduce((sum, item) => sum + item.receivedQuantity, 0).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Received Date</p>
                  <p className="font-semibold">{new Date(selectedGR.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          )}

          {message && (
            <p className={`text-sm ${message.type === "success" ? "text-green-600" : "text-red-600"}`}>
              {message.text}
            </p>
          )}

          <Button onClick={handleQASubmit} className="w-full bg-sky-600 hover:bg-sky-700">
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
                    <TableHead>GR ID</TableHead>
                    <TableHead className="text-center">Items</TableHead>
                    <TableHead>QA Status</TableHead>
                    <TableHead>QA Date</TableHead>
                    <TableHead>Comments</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {qaRecords.map((record, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-mono text-sm">{record.grId.substring(0, 8)}...</TableCell>
                      <TableCell className="text-center">{record.grItemCount}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            record.qaStatus === "Passed"
                              ? "bg-green-100 text-green-800"
                              : record.qaStatus === "Failed"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {record.qaStatus}
                        </span>
                      </TableCell>
                      <TableCell>{record.qaDate}</TableCell>
                      <TableCell className="text-sm text-gray-600">{record.qaComments || "-"}</TableCell>
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
