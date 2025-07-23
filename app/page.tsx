import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Code, Zap, Users, Download } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">AI Component Playground</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-5xl font-bold text-gray-900 mb-6">Build React Components with AI</h2>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Generate, preview, and export React components using natural language. Your AI-powered micro-frontend
          playground with persistent sessions and iterative refinement.
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" asChild>
            <Link href="/signup">Start Building</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">Everything you need to build components</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <Zap className="h-10 w-10 text-blue-600 mb-2" />
              <CardTitle>AI-Powered Generation</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Describe your component in natural language and watch AI generate clean, modern React code.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Code className="h-10 w-10 text-green-600 mb-2" />
              <CardTitle>Live Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                See your components rendered in real-time with syntax-highlighted code inspection.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-10 w-10 text-purple-600 mb-2" />
              <CardTitle>Persistent Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                All your work is saved automatically. Resume any session with full chat history and code.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Download className="h-10 w-10 text-orange-600 mb-2" />
              <CardTitle>Export & Download</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Copy code to clipboard or download complete component files ready for your project.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-4">Ready to build amazing components?</h3>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of developers using AI to accelerate their React development.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/signup">Get Started Free</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Code className="h-6 w-6" />
            <span className="text-lg font-semibold">AI Component Playground</span>
          </div>
          <p className="text-gray-400">Built with Next.js, OpenAI, and modern web technologies.</p>
        </div>
      </footer>
    </div>
  )
}
