// import ChatInput from "@/components/ChatInput"
import ChatInput from "../components/ChatInput"

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold mb-6">Cognita</h1>
      <ChatInput />
    </main>
  )
}