import { useContext } from 'react';
import { RagaStudioContext } from '../contexts/RagaStudioContext';

export function useRagaStudio() {
  const ctx = useContext(RagaStudioContext);
  if (!ctx) throw new Error('useRagaStudio must be used within a RagaStudioProvider');
  return ctx;
}
