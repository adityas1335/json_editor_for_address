import { JsonEditor } from "@/components/json-editor"

export default function Home() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6 text-center">Annotate Your Address📌</h1>
      <p className="text-center text-muted-foreground mb-8">
        Upload a CSV file with plain text and JSON columns to edit and manage your data!
      </p>
      <JsonEditor />
    </div>
  )
}
