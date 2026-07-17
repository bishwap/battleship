import { useContext } from 'react';
import { PwaContext } from '../contexts/PwaContext';

export function usePwa() {
  return useContext(PwaContext);
}
