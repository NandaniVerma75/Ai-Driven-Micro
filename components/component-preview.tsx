"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, Download, RefreshCw } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface ComponentPreviewProps {
  jsxCode: string
  cssCode: string
  onCodeChange?: (jsx: string, css: string) => void
}

export function ComponentPreview({ jsxCode, cssCode, onCodeChange }: ComponentPreviewProps) {
  const [previewKey, setPreviewKey] = useState(0)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const refreshPreview = () => {
    setPreviewKey((prev) => prev + 1)
  }

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copied!",
        description: `${type} code copied to clipboard`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      })
    }
  }

  const downloadCode = () => {
    const zip = `
// Component.tsx
${jsxCode}

/* styles.css */
${cssCode}
    `.trim()

    const blob = new Blob([zip], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "component-code.txt"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Downloaded!",
      description: "Component code downloaded successfully",
    })
  }

  // Create preview HTML
  const previewHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
      <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
      <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        body { margin: 0; padding: 20px; font-family: system-ui, -apple-system, sans-serif; }
        ${cssCode}
      </style>
    </head>
    <body>
      <div id="root"></div>
      <script type="text/babel">
        const { useState, useEffect, useRef } = React;
        
        ${jsxCode.replace("export default", "const Component =")}
        
        ReactDOM.render(<Component />, document.getElementById('root'));
      </script>
    </body>
    </html>
  `

  useEffect(() => {
    if (iframeRef.current) {
      const iframe = iframeRef.current
      iframe.srcdoc = previewHtml
    }
  }, [previewHtml, previewKey])

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold">Component Preview</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={refreshPreview}>
            <RefreshCw size={16} />
          </Button>
          <Button variant="outline" size="sm" onClick={downloadCode}>
            <Download size={16} />
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex-1 bg-white border-b">
          <iframe
            ref={iframeRef}
            key={previewKey}
            className="w-full h-full border-0"
            title="Component Preview"
            sandbox="allow-scripts"
          />
        </div>

        <div className="h-64">
          <Tabs defaultValue="jsx" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="jsx">JSX/TSX</TabsTrigger>
              <TabsTrigger value="css">CSS</TabsTrigger>
            </TabsList>

            <TabsContent value="jsx" className="flex-1 mt-0">
              <div className="h-full relative">
                <div className="absolute top-2 right-2 z-10">
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(jsxCode, "JSX")}>
                    <Copy size={16} />
                  </Button>
                </div>
                <pre className="h-full overflow-auto p-4 bg-gray-50 text-sm">
                  <code>{jsxCode}</code>
                </pre>
              </div>
            </TabsContent>

            <TabsContent value="css" className="flex-1 mt-0">
              <div className="h-full relative">
                <div className="absolute top-2 right-2 z-10">
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(cssCode, "CSS")}>
                    <Copy size={16} />
                  </Button>
                </div>
                <pre className="h-full overflow-auto p-4 bg-gray-50 text-sm">
                  <code>{cssCode}</code>
                </pre>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
