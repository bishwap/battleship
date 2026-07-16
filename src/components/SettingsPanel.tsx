import { useSettings } from '../contexts/SettingsContext';
import { usePwa } from '../contexts/PwaContext';

export function SettingsPanel() {
  const { settings, setSound, setHaptics, setReducedMotion } = useSettings();
  const { isInstalled, prompt, isIos } = usePwa();

  const handleInstall = async () => {
    if (prompt) {
      await prompt();
    }
  };

  return (
    <div className="bg-ocean-light/50 border border-grid rounded-lg p-3">
      <h3 className="text-accent text-sm font-bold tracking-wider mb-3 uppercase">Settings</h3>
      <div className="space-y-3">
        <label className="flex items-center justify-between gap-3 text-sm text-text cursor-pointer">
          <span>Sound</span>
          <input
            type="checkbox"
            checked={settings.sound}
            onChange={(e) => setSound(e.target.checked)}
            className="w-5 h-5 accent-radar cursor-pointer"
          />
        </label>

        <label className="flex items-center justify-between gap-3 text-sm text-text cursor-pointer">
          <span>Haptics</span>
          <input
            type="checkbox"
            checked={settings.haptics}
            onChange={(e) => setHaptics(e.target.checked)}
            className="w-5 h-5 accent-radar cursor-pointer"
          />
        </label>

        <label className="flex items-center justify-between gap-3 text-sm text-text cursor-pointer">
          <span>Reduced motion</span>
          <input
            type="checkbox"
            checked={settings.reducedMotion}
            onChange={(e) => setReducedMotion(e.target.checked)}
            className="w-5 h-5 accent-radar cursor-pointer"
          />
        </label>

        {isInstalled ? (
          <p className="text-sm text-ship-glow">Installed on home screen</p>
        ) : prompt ? (
          <button
            type="button"
            onClick={handleInstall}
            className="w-full min-h-[44px] px-4 py-2 rounded-lg border border-radar/50 bg-radar/10 text-radar-glow hover:bg-radar/20 transition-colors"
          >
            Install Battleshipz
          </button>
        ) : isIos ? (
          <p className="text-xs text-muted">
            To install on iOS: tap Share, then Add to Home Screen.
          </p>
        ) : null}
      </div>
    </div>
  );
}
