'use client'

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    return (
        <html>
            <body className="bg-white min-h-screen flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">심각한 오류가 발생했습니다.</h2>
                    <p className="text-gray-600 mb-6 bg-gray-100 p-4 rounded text-left text-sm font-mono overflow-auto max-h-40">
                        {error.message || "알 수 없는 오류"}
                    </p>
                    <button
                        onClick={() => reset()}
                        className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-indigo-700 transition"
                    >
                        다시 시도하기
                    </button>
                </div>
            </body>
        </html>
    )
}
