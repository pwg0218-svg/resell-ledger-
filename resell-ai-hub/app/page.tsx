import Link from 'next/link'
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-indigo-950 text-white p-4">
      <h1 className="text-4xl font-bold mb-8">Resell AI Hub</h1>
      <p className="mb-8 text-indigo-200">시스템 정상 작동 중입니다.</p>

      <Button asChild size="lg" className="bg-indigo-500 hover:bg-indigo-600 font-bold text-lg px-8 py-6 h-auto rounded-xl">
        <Link href="/ledger-original">
          🚀 장부 관리 시스템 접속하기
        </Link>
      </Button>

      <div className="mt-8 text-xs text-indigo-400">
        (v2.0.1 Stable)
      </div>
    </div>
  )
}
