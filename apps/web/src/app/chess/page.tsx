import { ChessGameProvider } from "@/contexts/ChessGameContext";
import { EnhancedChessBoard } from "@/components/EnhancedChessBoard";

export default function ChessPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            Elucidate Chess
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Interactive chess board with AI-powered analysis coming soon
          </p>
        </div>

        <ChessGameProvider>
          <div className="flex justify-center">
            <EnhancedChessBoard
              boardWidth={500}
              showMoveHistory={true}
              showControls={true}
              arePiecesDraggable={true}
            />
          </div>
        </ChessGameProvider>
      </div>
    </div>
  );
}