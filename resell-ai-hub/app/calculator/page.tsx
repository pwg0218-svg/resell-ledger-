"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Calculator } from "lucide-react"
import Link from "next/link"

export default function CalculatorPage() {
    const [purchasePrice, setPurchasePrice] = useState<number | "">("")
    const [sellPrice, setSellPrice] = useState<number | "">("")
    const [platform, setPlatform] = useState("kream")
    const [feeRate, setFeeRate] = useState(0)
    const [shippingCost, setShippingCost] = useState(3000)

    // Result states
    const [profit, setProfit] = useState<number | null>(null)
    const [margin, setMargin] = useState<number | null>(null)

    useEffect(() => {
        // KREAM basic fee structure (example)
        if (platform === "kream") setFeeRate(5.5) // ~5.5% usually
        if (platform === "soldout") setFeeRate(2.0)
        if (platform === "direct") setFeeRate(0)
    }, [platform])

    const calculate = () => {
        if (!purchasePrice || !sellPrice) return

        const pPrice = Number(purchasePrice)
        const sPrice = Number(sellPrice)

        // Fee calculation
        const fee = sPrice * (feeRate / 100)
        const totalCost = pPrice + fee + Number(shippingCost)

        const netProfit = sPrice - totalCost
        const marginRate = (netProfit / pPrice) * 100

        setProfit(Math.floor(netProfit))
        setMargin(Number(marginRate.toFixed(2)))
    }

    return (
        <div className="flex min-h-screen w-full flex-col bg-slate-950 text-slate-50">
            <div className="flex flex-col gap-4 p-4 md:gap-8 md:p-8 max-w-2xl mx-auto w-full">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" asChild>
                            <Link href="/">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <h1 className="text-2xl font-bold tracking-tight">수익률 계산기 (Calculator)</h1>
                    </div>
                </div>

                <Card className="bg-slate-900 border-slate-800 text-slate-50">
                    <CardHeader>
                        <CardTitle>마진 계산</CardTitle>
                        <CardDescription className="text-slate-400">
                            매입가와 판매가를 입력하면 예상 수익을 계산해드립니다.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label>플랫폼 선택</Label>
                            <Select value={platform} onValueChange={setPlatform}>
                                <SelectTrigger className="bg-slate-950 border-slate-800">
                                    <SelectValue placeholder="Platform" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="kream">KREAM (수수료 ~5.5%)</SelectItem>
                                    <SelectItem value="soldout">SoldOut (수수료 ~2%)</SelectItem>
                                    <SelectItem value="direct">직거래/번장 (수수료 0%)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>매입가 (구매 가격)</Label>
                                <Input
                                    type="number"
                                    placeholder="150000"
                                    className="bg-slate-950 border-slate-800"
                                    value={purchasePrice}
                                    onChange={(e) => setPurchasePrice(Number(e.target.value))}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>예상 판매가</Label>
                                <Input
                                    type="number"
                                    placeholder="200000"
                                    className="bg-slate-950 border-slate-800"
                                    value={sellPrice}
                                    onChange={(e) => setSellPrice(Number(e.target.value))}
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label>배송비 (내가 부담 시)</Label>
                            <Input
                                type="number"
                                value={shippingCost}
                                onChange={(e) => setShippingCost(Number(e.target.value))}
                                className="bg-slate-950 border-slate-800"
                            />
                        </div>

                        <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" onClick={calculate}>
                            <Calculator className="mr-2 h-4 w-4" />
                            계산하기
                        </Button>

                        {profit !== null && (
                            <div className="mt-6 rounded-lg border border-slate-800 bg-slate-950 p-4">
                                <div className="grid grid-cols-2 gap-4 text-center">
                                    <div>
                                        <div className="text-sm font-medium text-slate-400">순수익</div>
                                        <div className={`text-2xl font-bold ${profit > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                            {profit > 0 ? '+' : ''}{profit.toLocaleString()}원
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-slate-400">수익률</div>
                                        <div className={`text-2xl font-bold ${margin && margin > 0 ? 'text-blue-500' : 'text-red-500'}`}>
                                            {margin}%
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
