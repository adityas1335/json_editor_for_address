"use client"

import React, { useState, useEffect } from "react"
import Papa from "papaparse"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AlertCircle, FileUp, Download, Save } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface DataRow {
  plainText: string
  json: string
  parsedJson: any
  isValid: boolean
  index: number
}

// Define the JsonEditorComponent type
type JsonEditorComponentProps = {
  value: any
  onChange: (updatedJson: any) => void
}

// Define a simple JSON editor component (replace with a more robust one if needed)
const JsonEditorComponent: React.FC<JsonEditorComponentProps> = ({ value, onChange }) => {
  const [jsonString, setJsonString] = useState(JSON.stringify(value, null, 2))

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    setJsonString(newValue)
    try {
      const parsedJson = JSON.parse(newValue)
      onChange(parsedJson)
    } catch (error) {
      // Handle JSON parsing errors if needed
      console.error("Invalid JSON:", error)
    }
  }

  return <Textarea value={jsonString} onChange={handleChange} className="font-mono h-[350px]" />
}

export function JsonEditor() {
  const [data, setData] = useState<DataRow[]>([])
  const [selectedRow, setSelectedRow] = useState<number | null>(null)

  useEffect(() => {
    const savedData = localStorage.getItem('jsonEditorData')
    if (savedData) {
      setData(JSON.parse(savedData))
    }
    
    const savedRow = localStorage.getItem('selectedRow')
    if (savedRow) {
      setSelectedRow(parseInt(savedRow))
    }
  }, [])
  const [jsonEditorValue, setJsonEditorValue] = useState<string>("")
  const [error, setError] = useState<string | null>(null)

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (data.length > 0) {
      localStorage.setItem('jsonEditorData', JSON.stringify(data))
    }
  }, [data])

  // Save selected row to localStorage
  useEffect(() => {
    if (selectedRow !== null) {
      localStorage.setItem('selectedRow', selectedRow.toString())
    }
  }, [selectedRow])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setError(null)

    Papa.parse(file, {
      complete: (results) => {
        try {
          if (results.data.length <= 1) {
            throw new Error("CSV file appears to be empty or invalid")
          }

          const parsedData: DataRow[] = []

          // Always skip the first row as it contains headers
          for (let i = 1; i < results.data.length; i++) {
            const row = results.data[i] as string[]
            if (row.length < 2 || !row[0] || !row[1]) continue

            let isValid = true
            let parsedJson = null

            try {
              parsedJson = JSON.parse(row[1])
            } catch (e) {
              isValid = false
            }

            parsedData.push({
              plainText: row[0],
              json: row[1],
              parsedJson,
              isValid,
              index: parsedData.length,
            })
          }

          if (parsedData.length === 0) {
            throw new Error("No valid data rows found in CSV")
          }

          setData(parsedData)
          setSelectedRow(0)
          setJsonEditorValue(parsedData[0].json)
        } catch (err) {
          setError(err.message || "Failed to parse CSV file")
        }
      },
      error: (error) => {
        setError(`Error parsing CSV: ${error.message}`)
      },
    })

    // Reset file input
    event.target.value = ""
  }

  const handleJsonChange = (value: string) => {
    setJsonEditorValue(value)

    try {
      const parsedJson = JSON.parse(value)

      if (selectedRow !== null) {
        const updatedData = [...data]
        updatedData[selectedRow] = {
          ...updatedData[selectedRow],
          json: value,
          parsedJson,
          isValid: true,
        }
        setData(updatedData)
        setError(null)
      }
    } catch (e) {
      // Show error while editing
      setError(`JSON Error: ${e.message}`)
      
      if (selectedRow !== null) {
        const updatedData = [...data]
        updatedData[selectedRow] = {
          ...updatedData[selectedRow],
          json: value,
          isValid: false,
        }
        setData(updatedData)
      }
    }
  }

  const handleRowSelect = (index: number) => {
    setSelectedRow(index)

    // Update the jsonEditorValue with the selected row's JSON
    setJsonEditorValue(data[index].json)

    // Reset any error that might be showing
    setError(null)
  }

  const exportData = () => {
    const csvContent = [["Text", "JSON"], ...data.map((row) => [row.plainText, row.json])]
    
    // Get current date and time
    const now = new Date()
    const date = now.toISOString().split('T')[0]
    const time = now.toTimeString().split(' ')[0].replace(/:/g, '-')
    const filename = `Annotated_Data_${date}_${time}.csv`

    const csv = Papa.unparse(csvContent)
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)

    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", filename)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // Clear localStorage after successful export
    localStorage.removeItem('jsonEditorData')
    localStorage.removeItem('selectedRow')
    setData([])
    setSelectedRow(null)
    setJsonEditorValue("")
  }

  const formatJson = () => {
    if (selectedRow === null) return

    try {
      const parsed = JSON.parse(jsonEditorValue)
      const formatted = JSON.stringify(parsed, null, 2)
      setJsonEditorValue(formatted)

      const updatedData = [...data]
      updatedData[selectedRow] = {
        ...updatedData[selectedRow],
        json: formatted,
        parsedJson: parsed,
        isValid: true,
      }
      setData(updatedData)
    } catch (e) {
      setError("Cannot format invalid JSON")
    }
  }

  return (
    <div className="grid gap-6">
      <div className="flex justify-center">
        <div className="relative">
          <input type="file" id="file-upload" className="hidden" accept=".csv" onChange={handleFileUpload} />
          <Button asChild className="w-full">
            <label htmlFor="file-upload" className="cursor-pointer flex items-center gap-2">
              <FileUp className="h-4 w-4" />
              Upload CSV File
            </label>
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {data.length > 0 && selectedRow !== null && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Data Rows</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-2">
                  {data.map((row, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-md cursor-pointer border ${
                        selectedRow === index ? "border-primary bg-primary/10" : "border-border"
                      } ${!row.isValid ? "border-destructive" : ""}`}
                      onClick={() => handleRowSelect(index)}
                    >
                      <div className="flex items-center gap-2">
                        <span className="bg-muted text-muted-foreground rounded-full h-6 w-6 flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </span>
                        <div className="font-medium truncate">{row.plainText}</div>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 pl-8">
                        {row.isValid ? "Valid JSON" : "Invalid JSON"}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
            <CardFooter>
              <Button onClick={exportData} className="w-full flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </CardFooter>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="mb-4">
                <Tabs defaultValue="edit" className="w-full">
                  <TabsList>
                    <TabsTrigger value="edit">Edit</TabsTrigger>
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <CardTitle>{data[selectedRow]?.plainText || "JSON Editor"}</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="edit">
                <div className="hidden">
                  <TabsList>
                    <TabsTrigger value="edit">Edit</TabsTrigger>
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                  </TabsList>
                </div>
                <TabsContent value="edit">
                  <div className="space-y-4">
                    {data[selectedRow]?.isValid ? (
                      <JsonEditorComponent
                        key={selectedRow} // Add key to force re-render on row change
                        value={data[selectedRow]?.parsedJson}
                        onChange={(updatedJson) => {
                          const jsonString = JSON.stringify(updatedJson, null, 2)
                          setJsonEditorValue(jsonString)

                          const updatedData = [...data]
                          updatedData[selectedRow] = {
                            ...updatedData[selectedRow],
                            json: jsonString,
                            parsedJson: updatedJson,
                            isValid: true,
                          }
                          setData(updatedData)
                        }}
                      />
                    ) : (
                      <div className="space-y-4">
                        <Alert variant="destructive" className="mb-4">
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>Invalid JSON</AlertTitle>
                          <AlertDescription>The JSON in this row is invalid. Please fix it below.</AlertDescription>
                        </Alert>
                        <Textarea
                          value={jsonEditorValue}
                          onChange={(e) => handleJsonChange(e.target.value)}
                          className="font-mono h-[350px]"
                        />
                      </div>
                    )}
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={formatJson}>
                        Format JSON
                      </Button>
                      <Button className="flex items-center gap-2">
                        <Save className="h-4 w-4" />
                        Save Changes
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="preview">
                  <div className="border rounded-md p-4 h-[400px] overflow-auto bg-muted/50">
                    <pre className="text-sm">
                      {data[selectedRow]?.isValid
                        ? JSON.stringify(data[selectedRow]?.parsedJson, null, 2)
                        : "Invalid JSON"}
                    </pre>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}