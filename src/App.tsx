import { useGame } from './hooks/useGame';
import { Board } from './components/Board';
import { CommanderChat } from './components/CommanderChat';
import { FleetPanel } from './components/FleetPanel';
import { GameControls } from './components/GameControls';
import { StatusPanel } from './components/StatusPanel';

function App() {
  const { game, playerFire, startGame } = useGame();

  return (
    <div className="flex flex-col min-h-screen px-4 sm:px-6 py-2">
      <StatusPanel
        status={game.status}
        turn={game.turn}
        gameOver={game.gameOver}
        winner={game.winner}
      />

      <main className="flex-1 grid grid-cols-1 xl:grid-cols-12 gap-6 max-w-[1440px] mx-auto w-full">
        <section className="xl:col-span-8 flex flex-col gap-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 justify-items-center">
            <div className={game.shakeSide === 'player' ? 'animate-shake' : ''}>
              <Board
                board={game.playerBoard}
                isPlayerBoard
                disabled
                title="Your Fleet"
                lastShot={null}
              />
            </div>
            <div className={game.shakeSide === 'ai' ? 'animate-shake' : ''}>
              <Board
                board={game.enemyBoard}
                isPlayerBoard={false}
                onCellClick={(x, y) => playerFire(x, y)}
                disabled={game.turn !== 'player' || game.gameOver}
                title="Enemy Fleet"
                lastShot={null}
              />
            </div>
          </div>

          <div className="flex justify-center py-2">
            <GameControls onNewGame={startGame} />
          </div>
        </section>

        <aside className="xl:col-span-4 flex flex-col gap-4">
          <CommanderChat messages={game.chat} />
          <FleetPanel ships={game.playerBoard.ships} label="Your Fleet Status" />
          <FleetPanel ships={game.enemyBoard.ships} label="Enemy Fleet Status" />
        </aside>
      </main>
    </div>
  );
}

export default App;
