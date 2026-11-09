export type CharacterId = 'alex' | 'sarah' | 'mike' | 'toby' | 'kevin';

export type ActivityState =
  | 'IDLE'
  | 'WALKING'
  | 'WORKING'
  | 'DRINKING'
  | 'CHATTING'
  | 'RESTING'
  | 'SLEEPING'
  | 'GOING_HOME';

export interface GridCoord {
  x: number;
  y: number;
}

export interface CharacterData {
  id: CharacterId;
  name: string;
  role: string;
  bio: string;
  avatarColor: string;
  hairColor: string;
  shirtColor: string;
  pantsColor: string;
  deskId: string;
  deskCoord: GridCoord;
  currentCoord: GridCoord;
  targetCoord: GridCoord | null;
  path: GridCoord[];
  state: ActivityState;
  energy: number; // 0 - 100
  maxEnergy: number;
  coffeeCount: number;
  linesOfCodeOrTasks: number;
  currentThought: string;
  chatPartnerId?: CharacterId;
  stateTimer: number; // seconds remaining in current state
  facing: 'SE' | 'SW' | 'NE' | 'NW';
  isHome: boolean;
}

export type FurnitureType =
  | 'DESK'
  | 'CHAIR'
  | 'COFFEE_MACHINE'
  | 'WATER_DISPENSER'
  | 'SOFA'
  | 'PLANT'
  | 'BOOKSHELF'
  | 'WALL_CLOCK'
  | 'NOTICEBOARD'
  | 'WINDOW'
  | 'WHITEBOARD'
  | 'TRASH_BIN';

export interface FurnitureItem {
  id: string;
  type: FurnitureType;
  name: string;
  description: string;
  coord: GridCoord;
  width: number; // grid tiles
  height: number; // grid tiles
  walkable: boolean;
  interactionCoord?: GridCoord;
  facing?: 'SE' | 'SW' | 'NE' | 'NW';
  assignedCharacterId?: CharacterId;
  stateData?: {
    isBrewing?: boolean;
    screenBlink?: number;
    notesCount?: number;
    usesCount?: number;
  };
}

export interface ActivityLog {
  id: string;
  timeString: string;
  characterId?: CharacterId;
  characterName?: string;
  message: string;
  type: 'work' | 'coffee' | 'sleep' | 'chat' | 'break' | 'system';
  timestamp: number;
}

export interface SimulationState {
  simTimeMinutes: number; // minutes from midnight, e.g. 8:00 AM = 480
  timeString: string;
  dayProgress: number; // 0 to 1
  isPaused: boolean;
  speed: 1 | 2 | 4;
  characters: Record<CharacterId, CharacterData>;
  furniture: FurnitureItem[];
  selectedCharacterId: CharacterId | null;
  selectedFurnitureId: string | null;
  activeWorkersCount: number;
  totalCoffeesToday: number;
  totalTasksCompleted: number;
  dayEnded: boolean;
}
