import { AI_COMMANDER, PLAYER_COMMANDER } from './constants';
import type { ChatMessage, ShipStatus } from './types';

let messageId = 0;
function nextId(): string {
  return `${messageId++}`;
}

function random<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function sunkCount(ships: ShipStatus[]): number {
  return ships.filter((s) => s.sunk).length;
}

function getMood(playerShips: ShipStatus[], aiShips: ShipStatus[]): string {
  const playerSunk = sunkCount(playerShips);
  const aiSunk = sunkCount(aiShips);

  if (aiSunk === 4) return 'ai-doomed';
  if (playerSunk === 4) return 'player-doomed';
  if (playerSunk > aiSunk) return 'ai-ahead';
  if (aiSunk > playerSunk) return 'ai-behind';
  return 'even';
}

const playerMissLines: Record<string, string[]> = {
  even: [
    'Just water. Adjusting targeting computer.',
    'A miss, but the next one will find its mark.',
    'Nothing there. The ocean is wide.',
    'Clean miss. Recalculating.',
  ],
  'ai-behind': [
    'Close, but not close enough.',
    'A miss. I will find the next one.',
    'They are running out of sea room.',
    'Keep the pressure on.',
  ],
  'ai-ahead': [
    'Water. I cannot afford many more misses.',
    'Where are they hiding?',
    'That one stung. I need a hit.',
    'Recalculating under fire.',
  ],
  'player-doomed': [
    'A miss... and my fleet is nearly gone.',
    'Please, let the next one connect.',
    'Desperate times call for desperate shots.',
  ],
  'ai-doomed': [
    'A miss? They are almost beaten!',
    'I have them cornered, I can feel it.',
    'One more salvo and this is over.',
  ],
};

const playerHitLines: Record<string, string[]> = {
  even: [
    'Direct hit!',
    'On target!',
    'That is going to leave a mark.',
    'Hit confirmed.',
  ],
  'ai-behind': [
    'Another hit! The advantage grows.',
    'I am finding my rhythm.',
    'That is how you command a fleet.',
    'Keep them reeling.',
  ],
  'ai-ahead': [
    'A hit! I needed that.',
    'Finally, some payback.',
    'One small victory in a rough fight.',
    'I am still in this.',
  ],
  'player-doomed': [
    'A hit! There is still hope!',
    'Got one! I am not finished yet.',
    'Every hit counts now.',
  ],
  'ai-doomed': [
    'Hit! The end is near for them.',
    'One more step toward total victory.',
    'They are running out of ships.',
  ],
};

const playerSunkLines: Record<string, (ship: string) => string[]> = {
  even: (ship) => [
    `${ship} going down! Beautiful shot.`,
    `You sunk the ${ship}! One less threat.`,
    `The ${ship} is at the bottom of the sea.`,
  ],
  'ai-behind': (ship) => [
    `${ship} destroyed! The tide is turning.`,
    `The ${ship} is scrap. Keep firing.`,
    `Down goes the ${ship}! I am taking control.`,
  ],
  'ai-ahead': (ship) => [
    `${ship} sunk. A small win in a hard fight.`,
    `The ${ship} is down. I needed that.`,
    `There goes the ${ship}. One more, at least.`,
  ],
  'player-doomed': (ship) => [
    `${ship} sunk! I am not beaten yet.`,
    `The ${ship} is gone! Hope remains.`,
    `Take that! The ${ship} is no more.`,
  ],
  'ai-doomed': (ship) => [
    `${ship} destroyed! The machines are falling.`,
    `The ${ship} is finished. One more blow!`,
    `Bye bye, ${ship}. Victory is close.`,
  ],
};

const aiMissLines: Record<string, string[]> = {
  even: [
    'A miss. I will not make that mistake twice.',
    'Water. I will find you.',
    'That was only a probe.',
    'My next calculation will be better.',
  ],
  'ai-ahead': [
    'A miss, but I am still ahead.',
    'You cannot hide forever.',
    'A temporary lapse. The sea is mine.',
    'My fleet is stronger, regardless.',
  ],
  'ai-behind': [
    'A miss... I need to find them soon.',
    'I will not let a human out-think me.',
    'My algorithms demand a correction.',
    'The probabilities must shift.',
  ],
  'ai-doomed': [
    'No... I must hit something!',
    'My fleet is crumbling. I cannot miss again.',
    'Desperation is not in my programming, but it should be.',
    'I refuse to lose to a human!',
  ],
  'player-doomed': [
    'A miss, but you are already finished.',
    'I have you right where I want you.',
    'Run while you can, Admiral.',
    'One more hit and the ocean is silent for you.',
  ],
};

const aiHitLines: Record<string, string[]> = {
  even: [
    'You felt that one, did you not?',
    'A solid hit. Your hull is weakening.',
    'My targeting is improving.',
    'Hit! Fire is spreading.',
  ],
  'ai-ahead': [
    'Another calculated strike.',
    'You are outmatched.',
    'The machine navy does not miss.',
    'More where that came from.',
  ],
  'ai-behind': [
    'I finally drew blood.',
    'A hit. I needed that.',
    'The tide is turning.',
    'I am not beaten yet.',
  ],
  'ai-doomed': [
    'I am still in this fight!',
    'A hit! Perhaps my luck is changing.',
    'Desperation breeds accuracy.',
    'Take that, human!',
  ],
  'player-doomed': [
    'I am unstoppable!',
    'Your last ship is a mere target.',
    'Drown, Admiral.',
    'The end is near for you.',
  ],
};

const aiSunkLines: Record<string, (ship: string) => string[]> = {
  even: (ship) => [
    `My ${ship}! You will pay for that.`,
    `The ${ship} is lost. But I have more.`,
    `You sunk my ${ship}. Impudent.`,
  ],
  'ai-ahead': (ship) => [
    `The ${ship} is down, but I am still winning.`,
    `You took my ${ship}, yet my fleet remains superior.`,
    `A setback. I will retaliate.`,
  ],
  'ai-behind': (ship) => [
    `${ship} lost! This is turning ugly.`,
    `My ${ship} has fallen. I need to punish you.`,
    `That ${ship} was a veteran. I will avenge it.`,
  ],
  'ai-doomed': (ship) => [
    `My ${ship}! I am running out of fleet!`,
    `The ${ship} is gone. Is this really the end?`,
    `You sunk my ${ship}. I cannot let it end like this.`,
  ],
  'player-doomed': (ship) => [
    `${ship} destroyed! You are finished, Admiral.`,
    `Your ${ship} is scrap. I will finish you soon.`,
    `The ${ship} goes down. The sea is mine.`,
  ],
};

const playerWinLines = [
  'Victory! The fleet is destroyed.',
  'All enemy ships down. We win!',
  'Mission accomplished. The ocean is ours.',
];

const aiWinLines = [
  'Your fleet is scrap. I win.',
  'All ships sunk. Better luck next time, Admiral.',
  'Victory is mine. The sea belongs to the machines.',
];

const playerLoseLines = [
  'Our fleet is gone. Retreat!',
  'Defeat. The AI outmaneuvered us.',
  'All ships lost. The ocean is silent.',
];

const aiLoseLines = [
  'No... my fleet...',
  'Defeat? This is not possible.',
  'You have bested me, Admiral.',
];

export function createIntroMessages(): ChatMessage[] {
  return [
    {
      id: nextId(),
      speaker: 'player',
      text: `${PLAYER_COMMANDER}: Fleet positioned. Ready to engage.`,
      type: 'start',
    },
    {
      id: nextId(),
      speaker: 'ai',
      text: `${AI_COMMANDER}: I have already calculated your defeat. Fire when ready.`,
      type: 'start',
    },
  ];
}

export function addMessage(
  chat: ChatMessage[],
  speaker: ChatMessage['speaker'],
  text: string,
  type: ChatMessage['type']
): ChatMessage[] {
  return [...chat, { id: nextId(), speaker, text, type }];
}

export function playerMissMessage(
  chat: ChatMessage[],
  playerShips: ShipStatus[],
  aiShips: ShipStatus[]
): ChatMessage[] {
  const line = random(playerMissLines[getMood(playerShips, aiShips)]);
  return addMessage(chat, 'player', `${PLAYER_COMMANDER}: ${line}`, 'miss');
}

export function aiMissMessage(
  chat: ChatMessage[],
  playerShips: ShipStatus[],
  aiShips: ShipStatus[]
): ChatMessage[] {
  const line = random(aiMissLines[getMood(playerShips, aiShips)]);
  return addMessage(chat, 'ai', `${AI_COMMANDER}: ${line}`, 'miss');
}

export function playerHitMessage(
  chat: ChatMessage[],
  playerShips: ShipStatus[],
  aiShips: ShipStatus[]
): ChatMessage[] {
  const line = random(playerHitLines[getMood(playerShips, aiShips)]);
  return addMessage(chat, 'player', `${PLAYER_COMMANDER}: ${line}`, 'hit');
}

export function aiHitMessage(
  chat: ChatMessage[],
  playerShips: ShipStatus[],
  aiShips: ShipStatus[]
): ChatMessage[] {
  const line = random(aiHitLines[getMood(playerShips, aiShips)]);
  return addMessage(chat, 'ai', `${AI_COMMANDER}: ${line}`, 'hit');
}

export function playerSunkMessage(
  chat: ChatMessage[],
  playerShips: ShipStatus[],
  aiShips: ShipStatus[],
  shipName: string
): ChatMessage[] {
  const mood = getMood(playerShips, aiShips);
  const line = random(playerSunkLines[mood](shipName));
  return addMessage(chat, 'player', `${PLAYER_COMMANDER}: ${line}`, 'sunk');
}

export function aiSunkMessage(
  chat: ChatMessage[],
  playerShips: ShipStatus[],
  aiShips: ShipStatus[],
  shipName: string
): ChatMessage[] {
  const mood = getMood(playerShips, aiShips);
  const line = random(aiSunkLines[mood](shipName));
  return addMessage(chat, 'ai', `${AI_COMMANDER}: ${line}`, 'sunk');
}

export function playerWinMessage(chat: ChatMessage[]): ChatMessage[] {
  return addMessage(chat, 'system', `${random(playerWinLines)}`, 'win');
}

export function aiWinMessage(chat: ChatMessage[]): ChatMessage[] {
  return addMessage(chat, 'system', `${random(aiWinLines)}`, 'win');
}

export function playerLoseMessage(chat: ChatMessage[]): ChatMessage[] {
  return addMessage(chat, 'system', `${random(playerLoseLines)}`, 'lose');
}

export function aiLoseMessage(chat: ChatMessage[]): ChatMessage[] {
  return addMessage(chat, 'system', `${random(aiLoseLines)}`, 'lose');
}
