/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { DatabaseAdminPanel } from './components/database/DatabaseAdminPanel';
import { WorldDatabaseBrowser } from './components/database/WorldDatabaseBrowser';
import { NewGameModal } from './components/NewGameModal';
import { SavesManagerModal } from './components/SavesManagerModal';
import { StartScreen } from './components/StartScreen';
import { WorldCupModeModal } from './components/worldcup/WorldCupModeModal';
import { ChapasQuickPlayModal } from './components/chapas/ChapasQuickPlayModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { GameSave } from './types/game';

export default function App() {
  const [activeSave, setActiveSave] = useState<GameSave | null>(null);
  const [isNewGameOpen, setIsNewGameOpen] = useState<boolean>(false);
  const [isSavesManagerOpen, setIsSavesManagerOpen] = useState<boolean>(false);
  const [isWorldBrowserOpen, setIsWorldBrowserOpen] = useState<boolean>(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState<boolean>(false);
  const [isWorldCupOpen, setIsWorldCupOpen] = useState<boolean>(false);
  const [isChapasQuickPlayOpen, setIsChapasQuickPlayOpen] = useState<boolean>(false);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-slate-950 text-slate-100">
        {activeSave ? (
          <Dashboard
            initialSave={activeSave}
            onExitToMenu={() => setActiveSave(null)}
            onOpenWorldBrowser={() => setIsWorldBrowserOpen(true)}
            onOpenAdminPanel={() => setIsAdminPanelOpen(true)}
          />
        ) : (
          <StartScreen
            onNewGame={() => setIsNewGameOpen(true)}
            onContinueGame={(save) => setActiveSave(save)}
            onOpenSavesManager={() => setIsSavesManagerOpen(true)}
            onGameLoaded={(save) => setActiveSave(save)}
            onOpenWorldBrowser={() => setIsWorldBrowserOpen(true)}
            onOpenAdminPanel={() => setIsAdminPanelOpen(true)}
            onOpenWorldCup={() => setIsWorldCupOpen(true)}
            onOpenChapasQuickPlay={() => setIsChapasQuickPlayOpen(true)}
          />
        )}

      {/* New Game Wizard Modal */}
      <NewGameModal
        isOpen={isNewGameOpen}
        onClose={() => setIsNewGameOpen(false)}
        onGameCreated={(newSave) => {
          setActiveSave(newSave);
          setIsNewGameOpen(false);
        }}
      />

      {/* Saves Manager Modal */}
      <SavesManagerModal
        isOpen={isSavesManagerOpen}
        onClose={() => setIsSavesManagerOpen(false)}
        onLoadSave={(save) => {
          setActiveSave(save);
          setIsSavesManagerOpen(false);
        }}
        currentSaveId={activeSave?.metadata.id}
      />

      {/* World Football Database Browser Modal */}
      <WorldDatabaseBrowser
        isOpen={isWorldBrowserOpen}
        onClose={() => setIsWorldBrowserOpen(false)}
      />

      {/* Database Quality & Admin Control Panel Modal */}
      <DatabaseAdminPanel
        isOpen={isAdminPanelOpen}
        onClose={() => setIsAdminPanelOpen(false)}
      />

      {/* Standalone World Cup 2026 Tournament Modal */}
      {isWorldCupOpen && (
        <WorldCupModeModal
          isOpen={isWorldCupOpen}
          onClose={() => setIsWorldCupOpen(false)}
          playersMap={activeSave?.players || {}}
        />
      )}

      {/* Standalone Fútbol Chapas Direct Play Modal */}
      {isChapasQuickPlayOpen && (
        <ChapasQuickPlayModal
          isOpen={isChapasQuickPlayOpen}
          onClose={() => setIsChapasQuickPlayOpen(false)}
        />
      )}
      </div>
    </ErrorBoundary>
  );
}
