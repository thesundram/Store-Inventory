"use client"

import React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import {
  FileTextIcon,
  CheckCircleIcon,
  ShoppingCartIcon,
  TruckIcon,
  PackageIcon,
  ArrowUpRightIcon,
  LayoutDashboardIcon,
  ScrollTextIcon,
  MenuIcon,
  ChevronDownIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarNavItem {
  id: string
  label: string
  icon: React.ReactNode
  submenu?: SidebarNavItem[]
}

interface SidebarNavigationProps {
  currentStep: string
  onNavigate: (step: string) => void
}

const menuItems: SidebarNavItem[] = [
  { id: "create-pr", label: "Create PR", icon: <FileTextIcon className="h-5 w-5" /> },
  { id: "approve-pr", label: "PR Approval", icon: <CheckCircleIcon className="h-5 w-5" /> },
  { id: "create-po", label: "Create PO", icon: <ShoppingCartIcon className="h-5 w-5" /> },
  { id: "approve-po", label: "PO Approval", icon: <CheckCircleIcon className="h-5 w-5" /> },
  { id: "create-gr", label: "Create GR", icon: <TruckIcon className="h-5 w-5" /> },
  { id: "issue-item", label: "Issue Stock", icon: <ArrowUpRightIcon className="h-5 w-5" /> },
  {
    id: "reports",
    label: "Reports",
    icon: <ScrollTextIcon className="h-5 w-5" />,
    submenu: [
      { id: "view-dashboard", label: "Dashboard", icon: <LayoutDashboardIcon className="h-4 w-4" /> },
      { id: "view-stock", label: "View Stock", icon: <PackageIcon className="h-4 w-4" /> },
      { id: "view-pr-register", label: "PR Register", icon: <ScrollTextIcon className="h-4 w-4" /> },
      { id: "view-po-register", label: "PO Register", icon: <ScrollTextIcon className="h-4 w-4" /> },
      { id: "view-gr-register", label: "GR Register", icon: <ScrollTextIcon className="h-4 w-4" /> },
    ],
  },
]

export default function SidebarNavigation({ currentStep, onNavigate }: SidebarNavigationProps) {
  const [openMenus, setOpenMenus] = useState<Set<string>>(new Set(["reports"]))

  const toggleMenu = (id: string) => {
    const newOpenMenus = new Set(openMenus)
    if (newOpenMenus.has(id)) {
      newOpenMenus.delete(id)
    } else {
      newOpenMenus.add(id)
    }
    setOpenMenus(newOpenMenus)
  }

  const handleNavigate = (step: string) => {
    onNavigate(step)
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-gradient-to-b from-sky-50 to-blue-50 text-gray-900 flex-col h-screen sticky top-0 border-r border-blue-200 shadow-sm">
        {/* Header */}
        <div className="p-6 border-b border-blue-200">
          <h1 className="text-xl font-bold text-sky-700">Store Inventory</h1>
          <p className="text-sm text-sky-600 mt-1">Management Module</p>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {menuItems.map((item) => (
            <div key={item.id}>
              <button
                onClick={() => {
                  if (item.submenu) {
                    toggleMenu(item.id)
                  } else {
                    handleNavigate(item.id)
                  }
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                  currentStep === item.id || (item.submenu && openMenus.has(item.id))
                    ? "bg-sky-600 text-white"
                    : "text-gray-700 hover:bg-blue-100 hover:text-gray-900",
                )}
              >
                {item.icon}
                <span className="flex-1 text-left font-medium">{item.label}</span>
                {item.submenu && (
                  <ChevronDownIcon
                    className={cn(
                      "h-4 w-4 transition-transform",
                      openMenus.has(item.id) ? "rotate-180" : "",
                    )}
                  />
                )}
              </button>

              {/* Submenu */}
              {item.submenu && openMenus.has(item.id) && (
                    <div className="ml-4 mt-1 space-y-1 border-l border-blue-300 pl-4">
                      {item.submenu.map((subitem) => (
                        <button
                          key={subitem.id}
                          onClick={() => handleNavigate(subitem.id)}
                          className={cn(
                            "w-full flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all duration-200",
                            currentStep === subitem.id
                              ? "bg-sky-500 text-white"
                              : "text-gray-600 hover:bg-blue-100 hover:text-gray-800",
                          )}
                    >
                      {subitem.icon}
                      <span>{subitem.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-blue-200">
          <p className="text-xs text-sky-600 text-center">v1.0.0</p>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <div className="md:hidden fixed top-0 left-0 z-50">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="bg-sky-100 text-sky-700 hover:bg-sky-200">
              <MenuIcon className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 bg-gradient-to-b from-sky-50 to-blue-50 text-gray-900 border-blue-200">
            {/* Header */}
            <div className="p-6 border-b border-blue-200">
              <h1 className="text-xl font-bold text-sky-700">Store Inventory</h1>
              <p className="text-sm text-sky-600 mt-1">Management Module</p>
            </div>

            {/* Navigation Items */}
            <nav className="overflow-y-auto p-4 space-y-2">
              {menuItems.map((item) => (
                <div key={item.id}>
                  <button
                    onClick={() => {
                      if (item.submenu) {
                        toggleMenu(item.id)
                      } else {
                        handleNavigate(item.id)
                      }
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                      currentStep === item.id || (item.submenu && openMenus.has(item.id))
                        ? "bg-sky-600 text-white"
                        : "text-gray-700 hover:bg-blue-100 hover:text-gray-900",
                    )}
                  >
                    {item.icon}
                    <span className="flex-1 text-left font-medium">{item.label}</span>
                    {item.submenu && (
                      <ChevronDownIcon
                        className={cn(
                          "h-4 w-4 transition-transform",
                          openMenus.has(item.id) ? "rotate-180" : "",
                        )}
                      />
                    )}
                  </button>

                  {/* Submenu */}
                  {item.submenu && openMenus.has(item.id) && (
                    <div className="ml-4 mt-1 space-y-1 border-l border-red-700 pl-4">
                      {item.submenu.map((subitem) => (
                        <button
                          key={subitem.id}
                          onClick={() => handleNavigate(subitem.id)}
                          className={cn(
                            "w-full flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all duration-200",
                            currentStep === subitem.id
                              ? "bg-cyan-600 text-white"
                              : "text-slate-400 hover:bg-slate-700 hover:text-slate-200",
                          )}
                        >
                          {subitem.icon}
                          <span>{subitem.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
