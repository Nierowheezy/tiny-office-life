import {
  ActivityLog,
  ActivityState,
  CharacterData,
  CharacterId,
  FurnitureItem,
  GridCoord,
  SimulationState,
} from '../types';
import { INITIAL_CHARACTERS } from './CharacterState';
import { INITIAL_FURNITURE } from '../game/Furniture';
import { PathfindingGrid } from '../game/Pathfinding';
import { sounds } from '../audio/SoundEffects';

export type SimulationListener = (state: SimulationState) => void;
export type LogListener = (log: ActivityLog) => void;

export class OfficeSimulation {
  private characters: Record<CharacterId, CharacterData>;
  private furniture: FurnitureItem[];
  private pathfinder: PathfindingGrid;
  private simTimeMinutes: number = 480; // 8:00 AM
  private isPaused: boolean = false;
  private speed: 1 | 2 | 4 = 1;
  private selectedCharacterId: CharacterId | null = null;
  private selectedFurnitureId: string | null = null;
  private totalCoffeesToday: number = 2;
  private totalTasksCompleted: number = 0;
  private listeners: Set<SimulationListener> = new Set();
  private logListeners: Set<LogListener> = new Set();
  private logs: ActivityLog[] = [];
  private dayEnded: boolean = false;
  private secondAccumulator: number = 0;

  constructor() {
    this.characters = JSON.parse(JSON.stringify(INITIAL_CHARACTERS));
    this.furniture = JSON.parse(JSON.stringify(INITIAL_FURNITURE));
    this.pathfinder = new PathfindingGrid();
    this.initWalkability();

    // Initial system logs
    this.addLog({
      timeString: '08:00 AM',
      message: 'Office opened for the day. Coffee machine is primed and warm.',
      type: 'system',
    });
    this.addLog({
      timeString: '08:05 AM',
      characterId: 'alex',
      characterName: 'Alex',
      message: 'Alex arrived early and fired up the local dev environment.',
      type: 'work',
    });
  }

  private initWalkability() {
    // Mark walls unwalkable
    for (let x = 0; x < 13; x++) {
      this.pathfinder.setWalkable(x, 0, false); // Back-left wall line
    }
    for (let y = 0; y < 13; y++) {
      this.pathfinder.setWalkable(0, y, false); // Back-right wall line
    }

    // Mark furniture unwalkable
    this.furniture.forEach(item => {
      if (!item.walkable) {
        this.pathfinder.setWalkable(item.coord.x, item.coord.y, false);
      }
    });

    // Ensure aisles are always walkable
    // Desks are at (3,3), (6,3), (9,3), (4,7), (7,7)
    // Chairs are at (3,4), (6,4), (9,4), (4,8), (7,8) - keep chairs walkable so characters can sit!
  }

  public subscribe(fn: SimulationListener): () => void {
    this.listeners.add(fn);
    fn(this.getState());
    return () => this.listeners.delete(fn);
  }

  public subscribeLogs(fn: LogListener): () => void {
    this.logListeners.add(fn);
    return () => this.logListeners.delete(fn);
  }

  private notify() {
    const st = this.getState();
    this.listeners.forEach(fn => fn(st));
  }

  public addLog(entry: Omit<ActivityLog, 'id' | 'timestamp'>) {
    const log: ActivityLog = {
      ...entry,
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      timestamp: Date.now(),
    };
    this.logs.unshift(log);
    if (this.logs.length > 50) this.logs.pop();
    this.logListeners.forEach(fn => fn(log));
  }

  public getLogs(): ActivityLog[] {
    return [...this.logs];
  }

  public getState(): SimulationState {
    const hours = Math.floor(this.simTimeMinutes / 60);
    const mins = Math.floor(this.simTimeMinutes % 60);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayH = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    const timeString = `${displayH.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')} ${ampm}`;

    const activeWorkers = Object.values(this.characters).filter(
      c => !c.isHome && c.state === 'WORKING'
    ).length;

    // Day progress from 8:00 AM (480) to 6:00 PM (1080)
    const dayProgress = Math.min(1, Math.max(0, (this.simTimeMinutes - 480) / 600));

    return {
      simTimeMinutes: this.simTimeMinutes,
      timeString,
      dayProgress,
      isPaused: this.isPaused,
      speed: this.speed,
      characters: this.characters,
      furniture: this.furniture,
      selectedCharacterId: this.selectedCharacterId,
      selectedFurnitureId: this.selectedFurnitureId,
      activeWorkersCount: activeWorkers,
      totalCoffeesToday: this.totalCoffeesToday,
      totalTasksCompleted: this.totalTasksCompleted,
      dayEnded: this.dayEnded,
    };
  }

  public setPaused(paused: boolean) {
    this.isPaused = paused;
    sounds.playClick();
    this.notify();
  }

  public setSpeed(speed: 1 | 2 | 4) {
    this.speed = speed;
    sounds.playClick();
    this.notify();
  }

  public selectCharacter(id: CharacterId | null) {
    this.selectedCharacterId = id;
    if (id) {
      this.selectedFurnitureId = null;
      sounds.playClick();
    }
    this.notify();
  }

  public selectFurniture(id: string | null) {
    this.selectedFurnitureId = id;
    if (id) {
      this.selectedCharacterId = null;
      sounds.playClick();
    }
    this.notify();
  }

  public restartOfficeDay() {
    sounds.playChime();
    this.simTimeMinutes = 480; // 8:00 AM
    this.dayEnded = false;
    this.characters = JSON.parse(JSON.stringify(INITIAL_CHARACTERS));
    this.addLog({
      timeString: '08:00 AM',
      message: 'New office day started! The team gathers at their desks.',
      type: 'system',
    });
    this.notify();
  }

  public sendEveryoneHome() {
    sounds.playChime();
    this.dayEnded = true;
    this.addLog({
      timeString: this.getState().timeString,
      message: 'Day is wrapping up! Everyone is packing up their bags and heading home.',
      type: 'system',
    });

    Object.values(this.characters).forEach(c => {
      this.setDestination(c.id, { x: 12, y: 12 }, 'GOING_HOME');
      c.currentThought = 'Heading home to relax and recharge for tomorrow!';
    });
    this.notify();
  }

  /**
   * Quick User Action: Send character to coffee machine
   */
  public triggerCoffeeBreak(charId?: CharacterId) {
    const candidateId = charId || this.findBestCoffeeCandidate();
    if (!candidateId) return;

    const char = this.characters[candidateId];
    if (char.isHome) return;

    const coffeeSpot: GridCoord = { x: 2, y: 1 };
    this.setDestination(candidateId, coffeeSpot, 'DRINKING');
    char.currentThought = 'Heading over to the espresso bar for a fresh brew!';
    this.addLog({
      timeString: this.getState().timeString,
      characterId: char.id,
      characterName: char.name,
      message: `${char.name} stepped away to brew a fresh cup of coffee.`,
      type: 'coffee',
    });
    sounds.playClick();
    this.notify();
  }

  /**
   * Quick User Action: Cheer Up or Wake Up character
   */
  public cheerUpCharacter(charId: CharacterId) {
    const char = this.characters[charId];
    if (!char || char.isHome) return;

    char.energy = Math.min(100, char.energy + 40);
    sounds.playChime();

    if (char.state === 'SLEEPING') {
      char.state = 'WORKING';
      char.stateTimer = 15;
      char.currentThought = 'Woke up energized and ready to tackle tasks!';
      this.addLog({
        timeString: this.getState().timeString,
        characterId: char.id,
        characterName: char.name,
        message: `${char.name} woke up from a power nap feeling inspired!`,
        type: 'break',
      });
    } else {
      char.currentThought = 'Feeling appreciated and super motivated!';
      this.addLog({
        timeString: this.getState().timeString,
        characterId: char.id,
        characterName: char.name,
        message: `${char.name} received high praise and gained a boost of energy!`,
        type: 'work',
      });
    }
    this.notify();
  }

  /**
   * Quick User Action: Send to desk
   */
  public sendToDesk(charId: CharacterId) {
    const char = this.characters[charId];
    if (!char || char.isHome) return;

    this.setDestination(charId, char.deskCoord, 'WORKING');
    char.currentThought = 'Heading back to the desk to focus on code and designs.';
    sounds.playClick();
    this.notify();
  }

  private findBestCoffeeCandidate(): CharacterId | null {
    // Pick character with lowest energy or Toby
    const list = Object.values(this.characters).filter(c => !c.isHome && c.state !== 'GOING_HOME');
    if (list.length === 0) return null;
    list.sort((a, b) => a.energy - b.energy);
    return list[0].id;
  }

  public setDestination(charId: CharacterId, dest: GridCoord, nextState?: ActivityState) {
    const char = this.characters[charId];
    if (!char) return;

    const path = this.pathfinder.findPath(char.currentCoord, dest);
    if (path.length > 0) {
      char.path = path.slice(1); // exclude current tile
      char.targetCoord = dest;
      char.state = 'WALKING';
      if (nextState) {
        char.stateTimer = 10; // pending next state duration once arrived
      }
    }
  }

  /**
   * Main Simulation Update Loop (called from PixiJS ticker or requestAnimationFrame)
   * deltaSeconds is real time elapsed
   */
  public update(deltaSeconds: number) {
    if (this.isPaused) return;

    const effectiveDelta = deltaSeconds * this.speed;

    // Advance clock: 1 real second at 1x = 1 simulated minute
    this.secondAccumulator += effectiveDelta;
    if (this.secondAccumulator >= 1.0) {
      const minutesToAdd = Math.floor(this.secondAccumulator);
      this.simTimeMinutes += minutesToAdd;
      this.secondAccumulator -= minutesToAdd;

      // Check end of day (6:00 PM = 1080)
      if (this.simTimeMinutes >= 1080 && !this.dayEnded) {
        this.sendEveryoneHome();
      }

      this.notify();
    }

    // Update each character
    Object.values(this.characters).forEach(char => {
      this.updateCharacter(char, effectiveDelta);
    });
  }

  private updateCharacter(char: CharacterData, dt: number) {
    if (char.isHome) return;

    // 1. If Walking along path
    if (char.state === 'WALKING') {
      if (char.path.length > 0) {
        const nextTile = char.path[0];
        // Move character towards nextTile
        const speed = 2.0 * dt; // tiles per second
        const dx = nextTile.x - char.currentCoord.x;
        const dy = nextTile.y - char.currentCoord.y;
        const dist = Math.hypot(dx, dy);

        // Update facing
        if (Math.abs(dx) > Math.abs(dy)) {
          char.facing = dx > 0 ? 'SE' : 'NW';
        } else {
          char.facing = dy > 0 ? 'SW' : 'NE';
        }

        if (dist <= speed) {
          // Reached intermediate waypoint
          char.currentCoord.x = nextTile.x;
          char.currentCoord.y = nextTile.y;
          char.path.shift();

          if (char.path.length === 0) {
            // Reached destination!
            this.handleArrival(char);
          }
        } else {
          char.currentCoord.x += (dx / dist) * speed;
          char.currentCoord.y += (dy / dist) * speed;
        }
      } else {
        this.handleArrival(char);
      }
      return;
    }

    // 2. State-specific logic
    char.stateTimer -= dt;

    if (char.state === 'WORKING') {
      // Energy drains slowly
      char.energy = Math.max(0, char.energy - 0.4 * dt);
      char.linesOfCodeOrTasks += Math.floor(dt * 0.8);
      this.totalTasksCompleted += dt * 0.05;

      // Random gentle keyboard clack sound
      if (Math.random() < 0.05 * dt) {
        sounds.playKeyClack();
      }

      // Check for low energy exhaustion
      if (char.energy < 20) {
        if (char.id === 'kevin' || Math.random() < 0.4) {
          // Kevin or tired employee falls asleep
          char.state = 'SLEEPING';
          char.stateTimer = 18;
          char.currentThought = 'Zzz... so sleepy... just a quick 5 minute nap...';
          sounds.playZzz();
          this.addLog({
            timeString: this.getState().timeString,
            characterId: char.id,
            characterName: char.name,
            message: `${char.name} succumbed to fatigue and dozed off right at the desk 😴`,
            type: 'sleep',
          });
          return;
        } else {
          // Go to coffee machine
          this.triggerCoffeeBreak(char.id);
          return;
        }
      }

      // If work timer finished, pick next autonomous action!
      if (char.stateTimer <= 0) {
        this.decideNextAutonomousAction(char);
      }
    } else if (char.state === 'DRINKING') {
      // Restore energy while drinking coffee
      char.energy = Math.min(100, char.energy + 8 * dt);

      if (char.stateTimer <= 0) {
        char.coffeeCount++;
        this.totalCoffeesToday++;
        char.currentThought = 'Caffeine levels restored! Back to crushing the backlog.';
        this.addLog({
          timeString: this.getState().timeString,
          characterId: char.id,
          characterName: char.name,
          message: `${char.name} finished their coffee and headed back to work ☕`,
          type: 'work',
        });
        // Return to desk
        this.setDestination(char.id, char.deskCoord, 'WORKING');
      }
    } else if (char.state === 'CHATTING') {
      // Gentle socialization boost
      char.energy = Math.min(100, char.energy + 2 * dt);
      if (char.stateTimer <= 0) {
        char.currentThought = 'Great sync! Going back to work.';
        this.setDestination(char.id, char.deskCoord, 'WORKING');
      }
    } else if (char.state === 'SLEEPING') {
      // Energy recovers while sleeping
      char.energy = Math.min(100, char.energy + 4 * dt);
      if (char.stateTimer <= 0 || char.energy >= 80) {
        char.state = 'WORKING';
        char.stateTimer = 20;
        char.currentThought = 'Yawwn... feeling refreshed and ready to code!';
        this.addLog({
          timeString: this.getState().timeString,
          characterId: char.id,
          characterName: char.name,
          message: `${char.name} woke up energized and stretched out arms.`,
          type: 'break',
        });
      }
    } else if (char.state === 'RESTING') {
      char.energy = Math.min(100, char.energy + 5 * dt);
      if (char.stateTimer <= 0) {
        this.setDestination(char.id, char.deskCoord, 'WORKING');
      }
    }
  }

  private handleArrival(char: CharacterData) {
    if (char.state === 'GOING_HOME') {
      char.isHome = true;
      this.addLog({
        timeString: this.getState().timeString,
        characterId: char.id,
        characterName: char.name,
        message: `${char.name} clocked out and left the office for the evening.`,
        type: 'system',
      });
      return;
    }

    if (char.targetCoord) {
      char.currentCoord.x = char.targetCoord.x;
      char.currentCoord.y = char.targetCoord.y;
    }
    char.path = [];
    char.targetCoord = null;

    // Check where they arrived
    // 1. Arrived at Coffee Machine
    if (char.currentCoord.x === 2 && char.currentCoord.y === 1) {
      char.state = 'DRINKING';
      char.stateTimer = 8;
      char.facing = 'NW';
      sounds.playCoffeeBrew();
      // Set coffee machine brewing animation
      const coffeeItem = this.furniture.find(f => f.id === 'coffee_machine');
      if (coffeeItem && coffeeItem.stateData) {
        coffeeItem.stateData.isBrewing = true;
        setTimeout(() => {
          if (coffeeItem.stateData) coffeeItem.stateData.isBrewing = false;
        }, 5000);
      }
      return;
    }

    // 2. Arrived at Water Cooler
    if (char.currentCoord.x === 2 && char.currentCoord.y === 2) {
      char.state = 'DRINKING';
      char.stateTimer = 6;
      char.facing = 'NW';
      sounds.playWaterBloop();
      char.energy = Math.min(100, char.energy + 15);
      return;
    }

    // 3. Arrived at Sofa
    if (char.currentCoord.x === 10 && char.currentCoord.y === 7) {
      char.state = 'RESTING';
      char.stateTimer = 14;
      char.facing = 'SE';
      char.currentThought = 'Taking a relaxing break on the comfy sofa...';
      return;
    }

    // 4. Arrived back at Desk
    if (
      char.currentCoord.x === char.deskCoord.x &&
      char.currentCoord.y === char.deskCoord.y
    ) {
      char.state = 'WORKING';
      char.facing = 'NW';
      char.stateTimer = 15 + Math.random() * 20;
      return;
    }

    // Default arrived: enter idle / chatting
    char.state = 'IDLE';
    char.stateTimer = 6;
  }

  /**
   * Autonomous Decision Making per character personality
   */
  private decideNextAutonomousAction(char: CharacterData) {
    const roll = Math.random();

    // 1. Mike (The Manager) frequently walks around checking on colleagues
    if (char.id === 'mike' && roll < 0.65) {
      const colleagues: CharacterId[] = ['alex', 'sarah', 'toby', 'kevin'];
      const targetColleague = colleagues[Math.floor(Math.random() * colleagues.length)];
      const targetChar = this.characters[targetColleague];
      if (targetChar && !targetChar.isHome) {
        // Walk to tile next to colleague's desk
        const targetSpot: GridCoord = {
          x: targetChar.deskCoord.x + 1,
          y: targetChar.deskCoord.y,
        };
        this.setDestination(char.id, targetSpot, 'CHATTING');
        char.currentThought = `Checking in on ${targetChar.name} to see how the sprint is progressing.`;
        this.addLog({
          timeString: this.getState().timeString,
          characterId: char.id,
          characterName: char.name,
          message: `Mike stopped by ${targetChar.name}'s desk for a quick 1-on-1 check-in.`,
          type: 'chat',
        });
        return;
      }
    }

    // 2. Toby (The Intern) loves coffee & visiting the noticeboard
    if (char.id === 'toby' && (roll < 0.45 || char.energy < 50)) {
      this.triggerCoffeeBreak('toby');
      return;
    }

    // 3. Sarah (The Designer) checks plants or noticeboard or chats with Alex
    if (char.id === 'sarah' && roll < 0.4) {
      if (Math.random() < 0.5) {
        // Visit office plant
        this.setDestination(char.id, { x: 2, y: 6 }, 'IDLE');
        char.currentThought = 'Inspecting the monstera plant to make sure it has plenty of moisture.';
        this.addLog({
          timeString: this.getState().timeString,
          characterId: char.id,
          characterName: char.name,
          message: `Sarah watered the office monstera plant 🌿`,
          type: 'break',
        });
      } else {
        // Visit Alex for design handoff
        this.setDestination(char.id, { x: 4, y: 4 }, 'CHATTING');
        char.currentThought = 'Reviewing the responsive design tokens with Alex.';
        this.addLog({
          timeString: this.getState().timeString,
          characterId: char.id,
          characterName: char.name,
          message: `Sarah and Alex are collaborating on micro-interactions 💡`,
          type: 'chat',
        });
      }
      return;
    }

    // 4. Kevin (Sleepy) rests on the sofa if tired
    if (char.id === 'kevin' && (roll < 0.4 || char.energy < 40)) {
      this.setDestination(char.id, { x: 10, y: 7 }, 'RESTING');
      char.currentThought = 'Heading over to the velvet sofa for a 10-minute power nap...';
      this.addLog({
        timeString: this.getState().timeString,
        characterId: char.id,
        characterName: char.name,
        message: `Kevin slipped over to the lounge sofa to rest his eyes.`,
        type: 'sleep',
      });
      return;
    }

    // 5. Default: Continue working at desk!
    char.state = 'WORKING';
    char.stateTimer = 18 + Math.random() * 25;
    char.currentThought = this.getRandomWorkThought(char.id);
  }

  private getRandomWorkThought(id: CharacterId): string {
    const thoughts: Record<CharacterId, string[]> = {
      alex: [
        'Optimizing the isometric depth sorting algorithm...',
        'Running TypeScript unit tests in watch mode.',
        'Refactoring the state machine for cleaner transitions.',
        'Writing clean composable React hooks.',
        'Fixing an edge case in the A* pathfinding system.',
      ],
      sarah: [
        'Fine-tuning the pastel color palette contrast.',
        'Polishing pixel-art character animation frames.',
        'Designing the responsive mobile toolbar.',
        'Selecting cozy earthy tones for the breakroom.',
        'Creating smooth micro-interactions for button clicks.',
      ],
      mike: [
        'Reviewing team sprint velocity and milestones.',
        'Ordering fresh artisan Colombian coffee beans.',
        'Planning the upcoming Friday team game night.',
        'Balancing project timelines and team wellness.',
        'Sending out the quarterly office newsletter.',
      ],
      toby: [
        'Reading through the PixiJS v8 migration guides.',
        'Learning how isometric tile projection coordinates work.',
        'Fixing my first production pull request!',
        'Testing keyboard shortcuts in the web app.',
        'Wondering if there are donuts in the kitchenette...',
      ],
      kevin: [
        'Designing zero-downtime database migration scripts.',
        'Analyzing latency percentiles on the distributed cache.',
        'Thinking deeply with my eyes closed...',
        'Drafting technical architecture RFC for v2.0.',
        'Dreaming of elegant recursive algorithms.',
      ],
    };

    const list = thoughts[id] || thoughts.alex;
    return list[Math.floor(Math.random() * list.length)];
  }
}

export const officeSim = new OfficeSimulation();
