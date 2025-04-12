"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, Plus, ChevronDown, ChevronRight } from "lucide-react"

interface JsonEditorComponentProps {
  value: any
  onChange: (value: any) => void
  path?: string[]
}

export function JsonEditorComponent({ value, onChange, path = [] }: JsonEditorComponentProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const handleValueChange = (newValue: any, keyPath: string[]) => {
    const result = { ...value }
    let current = result

    // Navigate to the parent of the target property
    for (let i = 0; i < keyPath.length - 1; i++) {
      current = current[keyPath[i]]
    }

    // Update the value
    const lastKey = keyPath[keyPath.length - 1]
    current[lastKey] = newValue

    onChange(result)
  }

  const handleAddProperty = (obj: any, keyPath: string[]) => {
    const result = { ...value }
    let current = result

    // Navigate to the target object
    for (const key of keyPath) {
      current = current[key]
    }

    // Add new property
    current["newProperty"] = ""

    onChange(result)

    // Expand the parent to show the new property
    const parentKey = keyPath.join(".")
    setExpanded({ ...expanded, [parentKey]: true })
  }

  const handleAddArrayItem = (arr: any[], keyPath: string[]) => {
    const result = { ...value }
    let current = result

    // Navigate to the target array
    for (const key of keyPath) {
      current = current[key]
    }

    // Add new item based on the type of the array
    if (current.length > 0) {
      const lastItem = current[current.length - 1]
      if (typeof lastItem === "object" && lastItem !== null) {
        current.push({})
      } else {
        current.push("")
      }
    } else {
      current.push("")
    }

    onChange(result)

    // Expand the parent to show the new item
    const parentKey = keyPath.join(".")
    setExpanded({ ...expanded, [parentKey]: true })
  }

  const handleDeleteProperty = (keyPath: string[]) => {
    const result = { ...value }
    let current = result

    // Navigate to the parent of the target property
    for (let i = 0; i < keyPath.length - 1; i++) {
      current = current[keyPath[i]]
    }

    // Delete the property
    const lastKey = keyPath[keyPath.length - 1]
    if (Array.isArray(current)) {
      current.splice(Number.parseInt(lastKey), 1)
    } else {
      delete current[lastKey]
    }

    onChange(result)
  }

  const handleKeyChange = (oldKey: string, newKey: string, parentPath: string[]) => {
    if (oldKey === newKey) return

    const result = { ...value }
    let current = result

    // Navigate to the parent object
    for (const key of parentPath) {
      current = current[key]
    }

    // Create new property with the new key and copy the value
    current[newKey] = current[oldKey]

    // Delete the old property
    delete current[oldKey]

    onChange(result)
  }

  const toggleExpand = (key: string) => {
    setExpanded({ ...expanded, [key]: !expanded[key] })
  }

  const renderValue = (val: any, keyPath: string[]) => {
    const fullPath = keyPath.join(".")

    if (val === null) {
      return (
        <div className="flex items-center">
          <span className="text-muted-foreground italic">null</span>
        </div>
      )
    }

    if (typeof val === "boolean") {
      return (
        <div className="flex items-center gap-2">
          <select
            className="h-8 rounded-md border border-input bg-background px-3 text-sm"
            value={val.toString()}
            onChange={(e) => handleValueChange(e.target.value === "true", keyPath)}
          >
            <option value="true">true</option>
            <option value="false">false</option>
          </select>
        </div>
      )
    }

    if (typeof val === "number") {
      return (
        <div className="flex items-center">
          <Input
            type="number"
            value={val}
            onChange={(e) => handleValueChange(Number.parseFloat(e.target.value) || 0, keyPath)}
            className="h-8"
          />
        </div>
      )
    }

    if (typeof val === "string") {
      return (
        <div className="flex items-center">
          <Input type="text" value={val} onChange={(e) => handleValueChange(e.target.value, keyPath)} className="h-8" />
        </div>
      )
    }

    if (Array.isArray(val)) {
      const isExpanded = expanded[fullPath]

      return (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => toggleExpand(fullPath)}>
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
            <span className="text-muted-foreground">Array [{val.length}]</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 ml-auto"
              onClick={() => handleAddArrayItem(val, keyPath)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {isExpanded && (
            <div className="pl-6 border-l border-border space-y-2">
              {val.map((item, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="text-muted-foreground text-sm mt-2 w-10">[{index}]</div>
                  <div className="flex-1">{renderValue(item, [...keyPath, index.toString()])}</div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handleDeleteProperty([...keyPath, index.toString()])}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )
    }

    if (typeof val === "object") {
      const isExpanded = expanded[fullPath]
      const keys = Object.keys(val)

      return (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => toggleExpand(fullPath)}>
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
            <span className="text-muted-foreground">Object {`{${keys.length}}`}</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 ml-auto"
              onClick={() => handleAddProperty(val, keyPath)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {isExpanded && (
            <div className="pl-6 border-l border-border space-y-2">
              {keys.map((key) => (
                <div key={key} className="flex items-start gap-2">
                  <div className="w-1/3 min-w-[100px] max-w-[200px]">
                    <Input
                      type="text"
                      value={key}
                      onChange={(e) => handleKeyChange(key, e.target.value, keyPath)}
                      className="h-8"
                    />
                  </div>
                  <div className="flex-1">{renderValue(val[key], [...keyPath, key])}</div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handleDeleteProperty([...keyPath, key])}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )
    }

    return <div>Unknown type</div>
  }

  return <div className="border rounded-md p-4 bg-muted/20 overflow-auto h-[350px]">{renderValue(value, path)}</div>
}
