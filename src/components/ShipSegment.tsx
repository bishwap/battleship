import { Ship } from './Ship';

type ShipSegmentProps = {
  shipId?: string;
  length?: number;
  segment?: number;
  orientation?: 'horizontal' | 'vertical';
  state?: 'intact' | 'hit' | 'sunk';
};

export function ShipSegment({
  shipId,
  length = 1,
  segment = 0,
  orientation = 'horizontal',
  state = 'intact',
}: ShipSegmentProps) {
  const segmentCount = Math.max(1, length);
  const index = Math.min(segment, segmentCount - 1);
  const part = 100 / segmentCount;
  const viewBox =
    orientation === 'horizontal'
      ? `${part * index} 0 ${part} 100`
      : `0 ${part * index} 100 ${part}`;

  return (
    <Ship
      id={shipId}
      orientation={orientation}
      state={state}
      viewBox={viewBox}
      className="pointer-events-none w-full h-full p-0.5 pixel-art"
    />
  );
}
