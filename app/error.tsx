'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
            <h2 className="text-xl font-bold text-gray-900 mb-2">무언가 잘못되었습니다!</h2>
            <p className="text-gray-500 mb-6 text-sm">{error.message}</p>
            <div className="flex gap-4">
                <Button
                    onClick={
                        // Attempt to recover by trying to re-render the segment
                        () => reset()
                    }
                    variant="outline"
                >
                    다시 시도
                </Button>
                <Button
                    onClick={() => window.location.href = '/'}
                    className="bg-indigo-600 text-white"
                >
                    홈으로 이동
                </Button>
            </div>
        </div>
    )
}
