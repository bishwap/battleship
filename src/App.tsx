import { useEffect, useState } from 'react';
import { useGame } from './hooks/useGame';
import { SHIPS } from './lib/constants';
import { Board } from './components/Board';
import { CommanderChat } from './components/CommanderChat';
import { FleetPanel } from './components/FleetPanel';
import { GameControls } from './components/GameControls';
import { StatusPanel } from './components/StatusPanel';
import { Intro } from './components/Intro';
import { ResultOverlay } from './components/ResultOverlay';
import { ShipTray } from './components/ShipTray';
import { SetupControls } from './components/SetupControls';
import { TallyBoard } from './components/TallyBoard';

function App() {
  const {
    game,
    playerFire,
    startGame,
    setAdmiralName,
    placeShip,
    removeShipFromBoard,
    randomizePlacement,
    beginBattle,
  } = useGame();
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowIntro(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (game.phase === 'playing' && game.turn === 'player' && !game.gameOver) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [game.phase, game.turn, game.gameOver]);

  const playerLastShot = game.lastShot?.side === 'ai' ? game.lastShot : null;
  const enemyLastShot = game.lastShot?.side === 'player' ? game.lastShot : null;
  const playerSinkingShip = game.sinkingShip?.side === 'player' ? game.sinkingShip : null;
  const enemySinkingShip = game.sinkingShip?.side === 'ai' ? game.sinkingShip : null;

  const unplacedShips = SHIPS.filter(
    (ship) => !game.playerBoard.ships.some((placed) => placed.id === ship.id)
  );

  return (
    <div className="flex flex-col min-h-screen px-3 sm:px-6 py-2">
      {showIntro && <Intro onDone={() => setShowIntro(false)} />}

      <StatusPanel
        status={game.status}
        turn={game.turn}
        gameOver={game.gameOver}
        winner={game.winner}
        playerName={game.admiralName}
      />

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 max-w-[1400px] mx-auto w-full">
        <section className="lg:col-span-8 flex flex-col gap-4 sm:gap-6">
          {game.phase === 'setup' && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <label className="text-sm text-muted">Admiral Name</label>
              <input
                type="text"
                value={game.admiralName}
                onChange={(e) => setAdmiralName(e.target.value)}
                maxLength={20}
                className="px-3 py-2 rounded border border-grid bg-ocean-light text-text text-sm focus:border-radar focus:outline-none"
              />
              <SetupControls
                onRandomize={randomizePlacement}
                onStartBattle={beginBattle}
              />
            </div>
          )}

          {game.phase === 'playing' && (
            <div className={game.shakeSide === 'ai' ? 'animate-shake' : ''}>
              <Board
                board={game.enemyBoard}
                isPlayerBoard={false}
                onCellClick={(x, y) => playerFire(x, y)}
                disabled={game.turn !== 'player' || game.gameOver}
                title="Enemy Fleet"
                lastShot={enemyLastShot}
                sinkingShip={enemySinkingShip}
              />
            </div>
          )}

          {game.phase === 'playing' && (
            <div className={game.shakeSide === 'player' ? 'animate-shake' : ''}>
              <Board
                board={game.playerBoard}
                isPlayerBoard
                disabled
                title="Your Fleet"
                lastShot={playerLastShot}
                sinkingShip={playerSinkingShip}
              />
            </div>
          )}

          {game.phase === 'setup' && (
            <Board
              board={game.playerBoard}
              isPlayerBoard
              onCellClick={(x, y) => removeShipFromBoard(x, y)}
              onCellDrop={(shipId, orientation, x, y) => placeShip(shipId, x, y, orientation)}
              disabled={false}
              title="Your Fleet"
              lastShot={null}
              sinkingShip={null}
            />
          )}

          {game.phase === 'playing' && (
            <div className="flex justify-center py-2">
              <GameControls onNewGame={startGame} />
            </div>
          )}
        </section>

        <aside className="lg:col-span-4 flex flex-col gap-4 h-full">
          {game.phase === 'playing' && <CommanderChat messages={game.chat} />}
          <TallyBoard name={game.admiralName} tally={game.tally} />
          {game.phase === 'playing' && (
            <>
              <FleetPanel ships={game.enemyBoard.ships} label="Enemy Fleet Status" />
              <FleetPanel ships={game.playerBoard.ships} label="Your Fleet Status" />
            </>
          )}
          {game.phase === 'setup' && (
            <>
              <ShipTray ships={unplacedShips} />
              {game.playerBoard.ships.length > 0 && (
                <FleetPanel ships={game.playerBoard.ships} label="Placed Ships" />
              )}
            </>
          )}
        </aside>
      </main>

      {game.gameOver && game.winner && (
        <ResultOverlay
          winner={game.winner}
          playerName={game.admiralName}
          tally={game.tally}
          onPlayAgain={startGame}
        />
      )}
    </div>
  );
}

export default App;
