export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="flex flex-col items-center gap-8">
        <h1 className="text-6xl font-bold bg-gradient-to-r from-elucidate-primary-600 to-elucidate-accent-500 bg-clip-text text-transparent">
          Elucidate Chess
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          AI-Powered Chess Training
        </p>
        <div className="text-sm text-gray-500">
          Turborepo monorepo setup complete ✓
        </div>
      </div>
    </main>
  );
}
