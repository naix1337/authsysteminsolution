export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24">
            <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
                <h1 className="text-4xl font-bold text-center mb-8">
                    Auth System
                </h1>
                <p className="text-center text-lg mb-8">
                    Secure Forum & Authentication Platform
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                    <div className="p-6 border border-gray-300 rounded-lg hover:border-blue-500 transition">
                        <h2 className="text-xl font-semibold mb-2">🔐 Authentication</h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            JWT + Refresh Tokens, Device Fingerprinting, Session Management
                        </p>
                    </div>

                    <div className="p-6 border border-gray-300 rounded-lg hover:border-blue-500 transition">
                        <h2 className="text-xl font-semibold mb-2">🎫 Licensing</h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Trial, Subscription, Lifetime licenses with device binding
                        </p>
                    </div>

                    <div className="p-6 border border-gray-300 rounded-lg hover:border-blue-500 transition">
                        <h2 className="text-xl font-semibold mb-2">💬 Forum</h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Categories, Threads, Posts with RBAC/ABAC permissions
                        </p>
                    </div>
                </div>

                <div className="flex gap-4 justify-center mt-12">
                    <a
                        href="/login"
                        className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 transition"
                    >
                        Login
                    </a>
                    <a
                        href="/register"
                        className="rounded-lg border border-gray-300 px-6 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                    >
                        Register
                    </a>
                </div>

                <div className="text-center mt-12 text-sm text-gray-500">
                    <p>API Documentation: <a href="http://localhost:3001/api/docs" className="text-blue-500 hover:underline">Swagger UI</a></p>
                </div>
            </div>
        </main>
    )
}
