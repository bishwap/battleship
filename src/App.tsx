import { useGame } from './hooks/useGame';
import { Board } from './components/Board';
import { CommanderChat } from './components/CommanderChat';
import { FleetPanel } from './components/FleetPanel';
import { GameControls } from './components/GameControls';
import { StatusPanel } from './components/StatusPanel';

function App() {
  const { game, playerFire, startGame } = useGame();

  const playerLastShot = game.lastShot?.side === 'ai' ? game.lastShot : null;
  const enemyLastShot = game.lastShot?.side === 'player' ? game.lastShot : null;

  return (
    <div className="flex flex-col min-h-screen px-3 sm:px-6 py-2">
      <StatusPanel
        status={game.status}
        turn={game.turn}
        gameOver={game.gameOver}
        winner={game.winner}
      />

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 max-w-[1400px] mx-auto w-full">
        <section className="lg:col-span-7 flex flex-col gap-4 sm:gap-6 items-stretch">
          <div className={game.shakeSide === 'player' ? 'animate-shake' : ''}>
            <Board
              board={game.playerBoard}
              isPlayerBoard
              disabled
              title="Your Fleet"
              lastShot={playerLastShot}
            />
          </div>
          <div className={game.shakeSide === 'ai' ? 'animate-shake' : ''}>
            <Board
              board={game.enemyBoard}
              isPlayerBoard={false}
              onCellClick={(x, y) => playerFire(x, y)}
              disabled={game.turn !== 'player' || game.gameOver}
              title="Enemy Fleet"
              lastShot={enemyLastShot}
            />
          </div>

          <div className="flex justify-center py-2">
            <GameControls onNewGame={startGame} />
          </div>
        </section>

        <aside className="lg:col-span-5 flex flex-col gap-4">
          <CommanderChat messages={game.chat} />
          <FleetPanel ships={game.playerBoard.ships} label="Your Fleet Status" />
          <FleetPanel ships={game.enemyBoard.ships} label="Enemy Fleet Status" />
        </aside>
      </main>
    </div>
  );
}

export default App;
