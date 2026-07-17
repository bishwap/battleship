import { useCallback, useEffect, useState } from 'react';
import { useSettings } from './hooks/useSettings';
import { useGame } from './hooks/useGame';
import { feedback } from './lib/feedback';
import { SHIPS } from './lib/constants';
import { canPlaceShip, getShipBounds } from './lib/gameLogic';
import { Board } from './components/Board';
import { FleetPanel } from './components/FleetPanel';
import { GameControls } from './components/GameControls';
import { StatusPanel } from './components/StatusPanel';
import { Intro } from './components/Intro';
import { ResultOverlay } from './components/ResultOverlay';
import { ShipTray } from './components/ShipTray';
import { SetupControls } from './components/SetupControls';
import { BattleReadyOverlay } from './components/BattleReadyOverlay';
import { TallyBoard } from './components/TallyBoard';
import { SettingsPanel } from './components/SettingsPanel';
import { TutorialOverlay } from './components/TutorialOverlay';
import { HintBanner } from './components/HintBanner';
import { StatusBar } from './components/StatusBar';
import { NameEntry } from './components/NameEntry';

function App() {
  const {
    game,
    playerFire,
    startGame,
    setAdmiralName,
    placeShip,
    rotateShip,
    randomizePlacement,
    undoLastPlacement,
    beginBattle,
    dismissHint,
  } = useGame();
  const [showIntro, setShowIntro] = useState(true);
  const [selectedShip, setSelectedShip] = useState<string | null>(null);
  const [selectedOrientation, setSelectedOrientation] = useState<'horizontal' | 'vertical'>('horizontal');
  const [showBattleOverlay, setShowBattleOverlay] = useState(false);
  const [seenTutorial, setSeenTutorial] = useState(() => !!localStorage.getItem('battleShipz-seen-tutorial'));
  const [showTutorial, setShowTutorial] = useState(false);
  const [showNameEntry, setShowNameEntry] = useState(() => !localStorage.getItem('battleShipz-name-set'));
  const [fleetZoomed, setFleetZoomed] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const { settings, setSound } = useSettings();

  const handleRotateSelectedShip = useCallback(() => {
    if (!selectedShip) return;
    const ship = SHIPS.find((s) => s.id === selectedShip);
    if (!ship) return;
    const bounds = getShipBounds(game.playerBoard, selectedShip);
    if (bounds) {
      const newOrientation = bounds.orientation === 'horizontal' ? 'vertical' : 'horizontal';
      if (canPlaceShip(game.playerBoard.cells, ship, bounds.x, bounds.y, newOrientation, selectedShip)) {
        rotateShip(selectedShip);
        setSelectedOrientation(newOrientation);
      }
      return;
    }
    setSelectedOrientation((prev) => (prev === 'horizontal' ? 'vertical' : 'horizontal'));
  }, [selectedShip, game.playerBoard, rotateShip]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return;

      switch (e.key.toLowerCase()) {
        case 'n':
          e.preventDefault();
          startGame();
          break;
        case 'u':
          if (game.phase === 'setup') {
            e.preventDefault();
            undoLastPlacement();
          }
          break;
        case 'r':
          if (game.phase === 'setup') {
            e.preventDefault();
            if (selectedShip) {
              handleRotateSelectedShip();
            } else {
              randomizePlacement();
            }
          }
          break;
        case 'm':
          e.preventDefault();
          setSound(!settings.sound);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [game.phase, selectedShip, startGame, undoLastPlacement, randomizePlacement, handleRotateSelectedShip, setSound, settings.sound]);

  const playerLastShot = game.lastShot?.side === 'ai' ? game.lastShot : null;
  const enemyLastShot = game.lastShot?.side === 'player' ? game.lastShot : null;
  const playerSinkingShip = game.sinkingShip?.side === 'player' ? game.sinkingShip : null;
  const enemySinkingShip = game.sinkingShip?.side === 'ai' ? game.sinkingShip : null;
  const lastChatMessage = game.chat.filter((m) => m.type !== 'intro').at(-1);

  const unplacedShips = SHIPS.filter(
    (ship) => !game.playerBoard.ships.some((placed) => placed.id === ship.id)
  );

  const handleSelectShip = (shipId: string, orientation: 'horizontal' | 'vertical') => {
    setSelectedShip(shipId);
    setSelectedOrientation(orientation);
  };

  const handleSetupCellClick = (x: number, y: number) => {
    const cellShipId = game.playerBoard.cells[y]?.[x]?.shipId;
    const ship = selectedShip ? SHIPS.find((s) => s.id === selectedShip) : null;

    if (selectedShip && cellShipId === selectedShip && ship) {
      const bounds = getShipBounds(game.playerBoard, selectedShip);
      if (bounds) {
        const newOrientation = bounds.orientation === 'horizontal' ? 'vertical' : 'horizontal';
        if (canPlaceShip(game.playerBoard.cells, ship, bounds.x, bounds.y, newOrientation, selectedShip)) {
          rotateShip(selectedShip);
          setSelectedOrientation(newOrientation);
        }
      }
      return;
    }

    if (cellShipId) {
      const bounds = getShipBounds(game.playerBoard, cellShipId);
      setSelectedShip(cellShipId);
      setSelectedOrientation(bounds?.orientation ?? 'horizontal');
      return;
    }

    if (selectedShip && ship) {
      if (canPlaceShip(game.playerBoard.cells, ship, x, y, selectedOrientation, selectedShip)) {
        placeShip(selectedShip, x, y, selectedOrientation);
        setSelectedShip(null);
      }
    }
  };

  const handleRandomize = () => {
    setSelectedShip(null);
    randomizePlacement();
  };

  const handleUndo = () => {
    setSelectedShip(null);
    undoLastPlacement();
  };

  const handleStartBattle = () => {
    setSelectedShip(null);
    setShowBattleOverlay(true);
  };

  const handleConfirmBattle = () => {
    setShowBattleOverlay(false);
    beginBattle();
    feedback.playIntro();
  };

  const handleNewGame = () => {
    setSelectedShip(null);
    setFleetZoomed(false);
    setShowHint(false);
    startGame();
  };

  const handleIntroDone = () => {
    setShowIntro(false);
    if (showNameEntry) {
      setShowNameEntry(true);
    } else if (!seenTutorial) {
      setShowTutorial(true);
    }
  };

  const handleNameSet = useCallback(
    (name: string) => {
      setAdmiralName(name);
      localStorage.setItem('battleShipz-name-set', '1');
      setShowNameEntry(false);
      if (!seenTutorial) setShowTutorial(true);
    },
    [setAdmiralName, seenTutorial]
  );

  const handleTutorialDone = () => {
    setSeenTutorial(true);
    localStorage.setItem('battleShipz-seen-tutorial', '1');
    setShowTutorial(false);
  };

  const handleTutorialSkip = () => {
    setSeenTutorial(true);
    localStorage.setItem('battleShipz-seen-tutorial', '1');
    setShowTutorial(false);
  };

  const handleDismissHint = () => {
    setShowHint(false);
    dismissHint();
  };

  useEffect(() => {
    if (game.consecutiveMisses >= 3) setShowHint(true);
  }, [game.consecutiveMisses]);

  return (
    <div className="safe-area flex flex-col min-h-screen min-h-[100dvh] pb-24">
      {showIntro && <Intro onDone={handleIntroDone} />}
      {showNameEntry && <NameEntry defaultName={game.admiralName} onDone={handleNameSet} />}

      <StatusPanel
        playerName={game.admiralName}
        lastShot={game.lastShot}
        lastChatMessage={lastChatMessage}
      />

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 max-w-[1400px] mx-auto w-full">
        <section className="lg:col-span-8 flex flex-col gap-4 sm:gap-6">
          {game.phase === 'setup' && (
            <div className="flex flex-wrap items-center justify-center gap-3">
              <SetupControls
                onRandomize={handleRandomize}
                onStartBattle={handleStartBattle}
                onUndo={handleUndo}
                onRotate={selectedShip ? handleRotateSelectedShip : undefined}
                canUndo={game.placementHistory.length > 0}
                canStartBattle={game.playerBoard.ships.length === SHIPS.length}
                selectedShip={selectedShip}
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

          {game.phase === 'setup' && (
            <Board
              board={game.playerBoard}
              isPlayerBoard
              onCellClick={handleSetupCellClick}
              onCellDrop={(shipId, orientation, x, y) => {
                placeShip(shipId, x, y, orientation);
                setSelectedShip(null);
              }}
              onSelectShip={handleSelectShip}
              disabled={false}
              title="Your Fleet"
              lastShot={null}
              sinkingShip={null}
              selectedShip={selectedShip}
              selectedOrientation={selectedOrientation}
            />
          )}

          {game.phase === 'playing' && (
            <div className="flex justify-center py-2">
              <GameControls onNewGame={handleNewGame} />
            </div>
          )}
        </section>

        <aside className="lg:col-span-4 flex flex-col gap-4 h-full">
          {game.phase === 'playing' && (
            <div className="relative w-full mx-auto cursor-zoom-in" title="Click to zoom in on Your Fleet">
              <Board
                board={game.playerBoard}
                isPlayerBoard
                disabled
                title="Your Fleet"
                lastShot={playerLastShot}
                sinkingShip={playerSinkingShip}
              />
              <div
                role="button"
                tabIndex={0}
                aria-label="Zoom in on Your Fleet"
                className="absolute inset-0 rounded-lg"
                onClick={() => setFleetZoomed(true)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setFleetZoomed(true); }}
              />
            </div>
          )}
          <TallyBoard name={game.admiralName} tally={game.tally} />
          <SettingsPanel onOpenTutorial={() => setShowTutorial(true)} />
          {game.phase === 'playing' && (
            <>
              <FleetPanel ships={game.enemyBoard.ships} label="Enemy Fleet Status" />
              <FleetPanel ships={game.playerBoard.ships} label="Your Fleet Status" />
            </>
          )}
          {game.phase === 'setup' && (
            <>
              <ShipTray
                ships={unplacedShips}
                selectedShipId={selectedShip}
                onSelectShip={handleSelectShip}
              />
              {game.playerBoard.ships.length > 0 && (
                <FleetPanel ships={game.playerBoard.ships} label="Placed Ships" />
              )}
            </>
          )}
        </aside>
      </main>

      {showBattleOverlay && (
        <BattleReadyOverlay
          playerName={game.admiralName}
          onConfirm={handleConfirmBattle}
          onCancel={() => setShowBattleOverlay(false)}
        />
      )}

      {showTutorial && <TutorialOverlay onDone={handleTutorialDone} onSkip={handleTutorialSkip} />}

      {fleetZoomed && game.phase === 'playing' && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ocean/90 backdrop-blur-sm cursor-zoom-out"
          role="dialog"
          aria-modal="true"
          aria-label="Zoomed Your Fleet"
          onClick={() => setFleetZoomed(false)}
        >
          <div className="max-w-3xl w-full mx-4 p-2">
            <Board
              board={game.playerBoard}
              isPlayerBoard
              disabled
              title="Your Fleet"
              lastShot={playerLastShot}
              sinkingShip={playerSinkingShip}
            />
            <p className="text-center text-muted text-sm mt-2">Click anywhere to shrink</p>
          </div>
        </div>
      )}

      {game.gameOver && game.winner && (
        <ResultOverlay
          winner={game.winner}
          playerName={game.admiralName}
          tally={game.tally}
          stats={game.stats}
          onPlayAgain={handleNewGame}
        />
      )}

      <StatusBar status={game.status}>
        {showHint && <HintBanner onClose={handleDismissHint} />}
      </StatusBar>
    </div>
  );
}

export default App;
