import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Plus } from "lucide-react"
import Link from "next/link"

// Mock Data for the Ledger
const ledgerData = [
    { id: 1, date: "2024-02-01", item: "Nike Dunk Low Retro", size: "270", purchasePrice: 129000, sellPrice: 250000, platform: "KREAM", status: "Sold" },
    { id: 2, date: "2024-02-03", item: "Adidas Samba OG", size: "240", purchasePrice: 139000, sellPrice: 0, platform: "StockX", status: "Holding" },
    { id: 3, date: "2024-02-05", item: "New Balance 530", size: "260", purchasePrice: 109000, sellPrice: 140000, platform: "SoldOut", status: "Sold" },
];

export default function LedgerPage() {
    return (
        <div className="flex min-h-screen w-full flex-col bg-slate-950 text-slate-50">
            <div className="flex flex-col gap-4 p-4 md:gap-8 md:p-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" asChild>
                            <Link href="/">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <h1 className="text-2xl font-bold tracking-tight">리셀러 관리대장 (Ledger)</h1>
                    </div>
                    <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
                        <Plus className="h-4 w-4" />
                        새 항목 추가
                    </Button>
                </div>

                <Card className="bg-slate-900 border-slate-800 text-slate-50">
                    <CardHeader>
                        <CardTitle>보유 및 판매 목록</CardTitle>
                        <CardDescription className="text-slate-400">
                            현재 관리 중인 모든 상품의 입출고 내역입니다.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="relative w-full overflow-auto">
                            <table className="w-full caption-bottom text-sm text-left">
                                <thead className="[&_tr]:border-b [&_tr]:border-slate-800">
                                    <tr className="border-b transition-colors hover:bg-slate-800/50 data-[state=selected]:bg-slate-800">
                                        <th className="h-12 px-4 align-middle font-medium text-slate-400">날짜</th>
                                        <th className="h-12 px-4 align-middle font-medium text-slate-400">상품명</th>
                                        <th className="h-12 px-4 align-middle font-medium text-slate-400">사이즈</th>
                                        <th className="h-12 px-4 align-middle font-medium text-slate-400">구매가</th>
                                        <th className="h-12 px-4 align-middle font-medium text-slate-400">판매가</th>
                                        <th className="h-12 px-4 align-middle font-medium text-slate-400">플랫폼</th>
                                        <th className="h-12 px-4 align-middle font-medium text-slate-400">상태</th>
                                    </tr>
                                </thead>
                                <tbody className="[&_tr:last-child]:border-0">
                                    {ledgerData.map((item) => (
                                        <tr key={item.id} className="border-b border-slate-800 transition-colors hover:bg-slate-800/50">
                                            <td className="p-4 align-middle">{item.date}</td>
                                            <td className="p-4 align-middle font-medium">{item.item}</td>
                                            <td className="p-4 align-middle">{item.size}</td>
                                            <td className="p-4 align-middle text-red-400">₩{item.purchasePrice.toLocaleString()}</td>
                                            <td className="p-4 align-middle text-emerald-400">
                                                {item.sellPrice > 0 ? `₩${item.sellPrice.toLocaleString()}` : "-"}
                                            </td>
                                            <td className="p-4 align-middle">{item.platform}</td>
                                            <td className="p-4 align-middle">
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${item.status === 'Sold' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'
                                                    }`}>
                                                    {item.status === 'Sold' ? '판매완료' : '보유중'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
