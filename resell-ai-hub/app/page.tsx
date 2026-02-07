import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpRight, DollarSign, Package, ShoppingCart, Activity, Calculator } from "lucide-react"
import Link from "next/link"

export default function Dashboard() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-slate-950 text-slate-50">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/calculator">
              <Calculator className="mr-2 h-4 w-4" />
              수익률 계산기
            </Link>
          </Button>
          <Button size="sm" asChild className="bg-indigo-600 hover:bg-indigo-700 text-white">
            <Link href="/ledger">
              장부 관리
            </Link>
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <Card className="bg-slate-900 border-slate-800 text-slate-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 순수익 (Revenue)</CardTitle>
              <DollarSign className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₩45,231,890</div>
              <p className="text-xs text-slate-400">지난달 대비 +20.1% 상승</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-slate-800 text-slate-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">구독 중인 연구원</CardTitle>
              <Activity className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">10명</div>
              <p className="text-xs text-slate-400">나이키, 아디다스 등 감시 중</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-slate-800 text-slate-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">이번 달 판매량</CardTitle>
              <ShoppingCart className="h-4 w-4 text-indigo-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+1,234건</div>
              <p className="text-xs text-slate-400">지난달 대비 +19%</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-slate-800 text-slate-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">현재 활동 중</CardTitle>
              <Package className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">573개</div>
              <p className="text-xs text-slate-400">실시간 매물 추적 중</p>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
          <Card className="xl:col-span-2 bg-slate-900 border-slate-800 text-slate-50">
            <CardHeader className="flex flex-row items-center">
              <div className="grid gap-2">
                <CardTitle>최근 거래 내역</CardTitle>
                <CardDescription className="text-slate-400">
                  스토어에서 발생한 최근 거래입니다.
                </CardDescription>
              </div>
              <Button asChild size="sm" className="ml-auto gap-1 bg-indigo-600 hover:bg-indigo-700 text-white">
                <Link href="/ledger">
                  장부 전체 보기
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-slate-400">거래 내역이 여기에 표시됩니다. (현재 샘플 데이터)</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-slate-800 text-slate-50">
            <CardHeader>
              <CardTitle>AI 연구원 상태</CardTitle>
              <CardDescription className="text-slate-400">
                AI 봇 10명의 실시간 활동 로그입니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              {[
                { name: "나이키(Nike) 담당", status: "nikestore.co.kr 스캔 중..." },
                { name: "아디다스(Adidas) 담당", status: "신상품 데이터 분석 중..." },
                { name: "뉴발란스(NB) 담당", status: "재입고 알림 대기 중..." },
                { name: "무신사(Musinsa) 담당", status: "랭킹 데이터를 수집 중..." },
                { name: "크림(KREAM) 담당", status: "시세 변동 감지함!" },
              ].map((bot, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800">
                    <Activity className="h-4 w-4 text-emerald-500" />
                  </div>
                  <div className="grid gap-1">
                    <p className="text-sm font-medium leading-none text-slate-200">
                      {bot.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {bot.status}
                    </p>
                  </div>
                  <div className="ml-auto font-medium text-emerald-500 text-xs">Active</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
