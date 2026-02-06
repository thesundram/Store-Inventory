"use client"

import { useState } from "react"
import { P2PProvider, type PurchaseRequisition, type PurchaseOrder } from "@/context/p2p-context"
import SidebarNavigation from "@/components/sidebar-navigation"
import PrCreationScreen from "@/components/pr-creation-screen"
import PrApprovalScreen from "@/components/pr-approval-screen"
import PoCreationScreen from "@/components/po-creation-screen"
import PoApprovalScreen from "@/components/po-approval-screen"
import GrCreationScreen from "@/components/gr-creation-screen"
import StockViewScreen from "@/components/stock-view-screen"
import IssueEntryScreen from "@/components/issue-entry-screen"
import DashboardScreen from "@/components/dashboard-screen"
import PrRegisterScreen from "@/components/pr-register-screen"
import PoRegisterScreen from "@/components/po-register-screen"
import GrRegisterScreen from "@/components/gr-register-screen"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

type P2PStep =
  | "main-menu"
  | "create-pr"
  | "approve-pr"
  | "create-po"
  | "approve-po"
  | "create-gr"
  | "view-stock"
  | "issue-item"
  | "view-dashboard"
  | "view-pr-register"
  | "view-po-register"
  | "view-gr-register"

export default function P2PCycleProgram() {
  const [currentStep, setCurrentStep] = useState<P2PStep>("main-menu")
  const [selectedPrForPo, setSelectedPrForPo] = useState<PurchaseRequisition | null>(null)
  const [selectedPoForGr, setSelectedPoForGr] = useState<PurchaseOrder | null>(null)

  const handlePrApproved = (pr: PurchaseRequisition) => {
    setSelectedPrForPo(pr)
    setCurrentStep("create-po")
  }

  const handlePoApproved = (po: PurchaseOrder) => {
    setSelectedPoForGr(po)
    setCurrentStep("create-gr")
  }

  const handleBackToMainMenu = () => {
    setCurrentStep("main-menu")
    setSelectedPrForPo(null)
    setSelectedPoForGr(null)
  }

  const handleNavigate = (step: string) => {
    setCurrentStep(step as P2PStep)
  }

  return (
    <P2PProvider>
      <div className="flex min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-white">
        {/* Sidebar Navigation */}
        <SidebarNavigation currentStep={currentStep} onNavigate={handleNavigate} />

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto">
          <div className="flex items-center justify-center min-h-screen p-4 md:p-8">
            {currentStep === "main-menu" && (
              <Card className="w-full max-w-2xl border-blue-200 bg-white shadow-lg">
                <CardHeader className="bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-t-lg py-8">
                  <CardTitle className="text-center text-4xl font-extrabold">Store Inventory Module</CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="text-center space-y-6">
                    <p className="text-slate-600 text-lg font-medium">Welcome to the Store Inventory Management System</p>
                    <p className="text-slate-500">Use the sidebar navigation to access all features and manage your inventory efficiently.</p>
                    <div className="pt-4 md:hidden bg-slate-100 p-4 rounded-lg">
                      <p className="text-sm text-slate-600">
                        Tap the <span className="font-semibold">menu icon</span> in the top-left corner to access all options
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {currentStep === "create-pr" && <PrCreationScreen onSuccess={handleBackToMainMenu} onBack={handleBackToMainMenu} />}
            {currentStep === "approve-pr" && <PrApprovalScreen onBack={handleBackToMainMenu} onSelectPR={handlePrApproved} />}
            {currentStep === "create-po" && (
              <PoCreationScreen onSuccess={handleBackToMainMenu} onBack={handleBackToMainMenu} selectedPrForPo={selectedPrForPo} />
            )}
            {currentStep === "approve-po" && (
              <PoApprovalScreen onBack={handleBackToMainMenu} onSelectPO={handlePoApproved} />
            )}
            {currentStep === "create-gr" && (
              <GrCreationScreen onBack={handleBackToMainMenu} onSuccess={handleBackToMainMenu} selectedPoForGr={selectedPoForGr} />
            )}
            {currentStep === "view-stock" && <StockViewScreen onBack={handleBackToMainMenu} />}
            {currentStep === "issue-item" && <IssueEntryScreen onSuccess={handleBackToMainMenu} onBack={handleBackToMainMenu} />}
            {currentStep === "view-dashboard" && <DashboardScreen onBack={handleBackToMainMenu} />}
            {currentStep === "view-pr-register" && <PrRegisterScreen onBack={handleBackToMainMenu} />}
            {currentStep === "view-po-register" && <PoRegisterScreen onBack={handleBackToMainMenu} />}
            {currentStep === "view-gr-register" && <GrRegisterScreen onBack={handleBackToMainMenu} />}
          </div>
        </main>
      </div>
    </P2PProvider>
  )
}
