import { AI_COMMANDER, PLAYER_COMMANDER } from './constants';
import type { ChatMessage } from './types';

let messageId = 0;
function nextId(): string {
  return `${messageId++}`;
}

const playerMissLines = [
  'Just water. Adjusting targeting computer.',
  'A miss, but the next one will find its mark.',
  'Nothing there. The ocean is wide.',
  'Clean miss. Recalculating.',
];

const aiMissLines = [
  'Ha! You move fast for a human.',
  'A miss. I will not make that mistake twice.',
  'Water. I will find you.',
  'That was only a probe.',
];

const playerHitLines = [
  'Direct hit!',
  'On target!',
  'That is going to leave a mark.',
  'Hit confirmed.',
];

const aiHitLines = [
  'You felt that one, did you not?',
  'A solid hit. Your hull is weakening.',
  'My targeting is improving.',
  'Hit! Fire is spreading.',
];

const playerSunkLines = (ship: string) => [
  `${ship} going down! Beautiful shot.`,
  `You sunk the ${ship}! One less threat.`,
  `The ${ship} is at the bottom of the sea.`,
];

const aiSunkLines = (ship: string) => [
  `My ${ship}! You will pay for that.`,
  `The ${ship} is lost. But I have more.`,
  `You sunk my ${ship}. Impudent.`,
];

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

function random<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

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

export function playerMissMessage(chat: ChatMessage[]): ChatMessage[] {
  return addMessage(chat, 'player', `${PLAYER_COMMANDER}: ${random(playerMissLines)}`, 'miss');
}

export function aiMissMessage(chat: ChatMessage[]): ChatMessage[] {
  return addMessage(chat, 'ai', `${AI_COMMANDER}: ${random(aiMissLines)}`, 'miss');
}

export function playerHitMessage(chat: ChatMessage[]): ChatMessage[] {
  return addMessage(chat, 'player', `${PLAYER_COMMANDER}: ${random(playerHitLines)}`, 'hit');
}

export function aiHitMessage(chat: ChatMessage[]): ChatMessage[] {
  return addMessage(chat, 'ai', `${AI_COMMANDER}: ${random(aiHitLines)}`, 'hit');
}

export function playerSunkMessage(chat: ChatMessage[], shipName: string): ChatMessage[] {
  return addMessage(chat, 'player', `${PLAYER_COMMANDER}: ${random(playerSunkLines(shipName))}`, 'sunk');
}

export function aiSunkMessage(chat: ChatMessage[], shipName: string): ChatMessage[] {
  return addMessage(chat, 'ai', `${AI_COMMANDER}: ${random(aiSunkLines(shipName))}`, 'sunk');
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
