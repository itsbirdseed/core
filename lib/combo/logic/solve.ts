import { GAMES } from '../config';
import { Random } from '../random';
import { gameId } from '../util';
import { pathfind, Reachable } from './pathfind';
import { Items } from './state';
import { World } from './world';
import { LogicSeedError } from './error';
import { CONSTRAINTS, itemConstraint } from './constraints';
import { Options } from '../options';

const ITEMS_DUNGEON = /^(OOT|MM)_(MAP|COMPASS|SMALL_KEY|BOSS_KEY|STRAY_FAIRY)_[A-Z_]+$/;
export const ORDERED_DUNGEON_REWARDS = [
  'OOT_STONE_EMERALD',
  'OOT_STONE_RUBY',
  'OOT_STONE_SAPPHIRE',
  'OOT_MEDALLION_LIGHT',
  'OOT_MEDALLION_FOREST',
  'OOT_MEDALLION_FIRE',
  'OOT_MEDALLION_WATER',
  'OOT_MEDALLION_SPIRIT',
  'OOT_MEDALLION_SHADOW',
  'MM_REMAINS_ODOLWA',
  'MM_REMAINS_GOHT',
  'MM_REMAINS_GYORG',
  'MM_REMAINS_TWINMOLD',
];

export const ITEMS_DUNGEON_REWARDS = new Set(ORDERED_DUNGEON_REWARDS);

export const ITEMS_REQUIRED = new Set<string>([
  'OOT_GS_TOKEN',
  'OOT_ARROW_FIRE',
  'OOT_ARROW_LIGHT',
  'OOT_BOMB_BAG',
  'OOT_BOMBCHUS_10',
  'OOT_BOOMERANG',
  'OOT_BOOTS_HOVER',
  'OOT_BOOTS_IRON',
  'OOT_BOW',
  'OOT_CHICKEN',
  'OOT_EMPTY_BOTTLE',
  'OOT_GERUDO_CARD',
  'OOT_HAMMER',
  'OOT_HOOKSHOT',
  'OOT_LENS',
  'OOT_MAGIC_UPGRADE',
  'OOT_OCARINA',
  'OOT_RUTO_LETTER',
  'OOT_SCALE',
  'OOT_SHIELD',
  'OOT_SLINGSHOT',
  'OOT_SONG_EPONA',
  'OOT_SONG_SARIA',
  'OOT_SONG_STORMS',
  'OOT_SONG_SUN',
  'OOT_SONG_TIME',
  'OOT_SONG_ZELDA',
  'OOT_SONG_TP_FIRE',
  'OOT_SONG_TP_SHADOW',
  'OOT_SONG_TP_SPIRIT',
  'OOT_SPELL_FIRE',
  'OOT_STRENGTH',
  'OOT_SWORD',
  'OOT_TUNIC_GORON',
  'OOT_TUNIC_ZORA',
  'OOT_ZELDA_LETTER',
  'OOT_MAGIC_BEAN',
  'OOT_MILK_BOTTLE',
  'OOT_STONE_OF_AGONY',
  'OOT_WALLET',
  'OOT_POCKET_CUCCO',
  'OOT_COJIRO',
  'OOT_ODD_MUSHROOM',
  'OOT_ODD_POTION',
  'OOT_POACHER_SAW',
  'OOT_BROKEN_GORON_SWORD',
  'OOT_PRESCRIPTION',
  'OOT_EYEBALL_FROG',
  'OOT_EYE_DROPS',
  'OOT_CLAIM_CHECK',
  'OOT_MASK_TRUTH',
  'OOT_MASK_SKULL',
  'MM_MASK_DEKU',
  'MM_MASK_GORON',
  'MM_MASK_ZORA',
  'MM_MASK_CAPTAIN',
  'MM_MASK_GIANT',
  'MM_MASK_ALL_NIGHT',
  'MM_MASK_BUNNY',
  'MM_MASK_KEATON',
  'MM_MASK_GARO',
  'MM_MASK_ROMANI',
  'MM_MASK_TROUPE_LEADER',
  'MM_MASK_POSTMAN',
  'MM_MASK_COUPLE',
  'MM_MASK_GREAT_FAIRY',
  'MM_MASK_GIBDO',
  'MM_MASK_DON_GERO',
  'MM_MASK_KAMARO',
  'MM_MASK_TRUTH',
  'MM_MASK_STONE',
  'MM_MASK_BREMEN',
  'MM_MASK_BLAST',
  'MM_MASK_SCENTS',
  'MM_MASK_KAFEI',
  'MM_BOTTLED_POTION_RED',
  'MM_BOTTLED_GOLD_DUST',
  'MM_EMPTY_BOTTLE',
  'MM_BOTTLED_MILK',
  'MM_MAGIC_UPGRADE',
  'MM_SONG_TIME',
  'MM_SONG_AWAKENING',
  'MM_SONG_HEALING',
  'MM_SONG_EPONA',
  'MM_SONG_SOARING',
  'MM_SONG_GORON_HALF',
  'MM_SONG_ZORA',
  'MM_SONG_STORMS',
  'MM_SONG_EMPTINESS',
  'MM_SONG_ORDER',
  'MM_BOW',
  'MM_OCARINA',
  'MM_SWORD',
  'MM_SHIELD',
  'MM_BOMB_BAG',
  'MM_LENS',
  'MM_ARROW_FIRE',
  'MM_ARROW_ICE',
  'MM_ARROW_LIGHT',
  'MM_POWDER_KEG',
  'MM_HOOKSHOT',
  'MM_PICTOGRAPH_BOX',
  'MM_MAGIC_BEAN',
  'MM_MOON_TEAR',
  'MM_DEED_LAND',
  'MM_DEED_SWAMP',
  'MM_DEED_MOUNTAIN',
  'MM_DEED_OCEAN',
  'MM_ROOM_KEY',
  'MM_LETTER_TO_KAFEI',
  'MM_PENDANT_OF_MEMORIES',
  'MM_LETTER_TO_MAMA',
  'MM_WALLET',
  'MM_HEART_PIECE',
  'MM_HEART_CONTAINER',
  'MM_GREAT_FAIRY_SWORD',
]);

const ITEMS_JUNK = new Set<string>([
  'OOT_RUPEE_GREEN',
  'OOT_RUPEE_BLUE',
  'OOT_RUPEE_RED',
  'OOT_RECOVERY_HEART',
  'OOT_ARROWS_5',
  'OOT_ARROWS_10',
  'OOT_ARROWS_30',
  'MM_RUPEE_GREEN',
  'MM_RUPEE_BLUE',
  'MM_RUPEE_RED',
  'MM_RECOVERY_HEART',
]);

const EXTRA_ITEMS = [
  'OOT_MASK_SKULL',
  'OOT_MASK_SPOOKY',
  'OOT_MASK_KEATON',
  'OOT_MASK_BUNNY',
  'OOT_MASK_TRUTH',
  'OOT_MASK_GORON',
  'OOT_MASK_ZORA',
  'OOT_MASK_GERUDO',
  'MM_MASK_DEKU',
  'MM_SHIELD',
  'MM_SWORD',
];

const randomInt = (random: Random, max: number) => {
  /* Create a mask that is all 1s up to the max value */
  let mask = max - 1;
  mask |= mask >> 1;
  mask |= mask >> 2;
  mask |= mask >> 4;
  mask |= mask >> 8;
  mask |= mask >> 16;

  for (;;) {
    const value = (random.next() >>> 8) & mask;
    if (value < max) {
      return value;
    }
  }
};

const sample = <T>(random: Random, arr: T[]): T => {
  if (arr.length === 0) {
    throw new Error('Empty Array');
  }

  const index = randomInt(random, arr.length);
  return ([...arr].sort())[index];
};

const shuffle = <T>(random: Random, arr: T[]): T[] => {
  const copy = [...arr].sort();
  for (let i = 0; i < copy.length - 1; i++) {
    const j = i + randomInt(random, copy.length - i);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

export type ItemPlacement = {[k: string]: string};

type ItemPools = {
  dungeon: Items,
  required: Items,
  nice: Items,
  junk: Items,
};

const itemsArray = (items: Items) => {
  const arr: string[] = [];
  for (const item in items) {
    for (let i = 0; i < items[item]; i++) {
      arr.push(item);
    }
  }
  return arr;
};

const poolsArray = (pools: ItemPools) => {
  return [
    ...itemsArray(pools.required),
    ...itemsArray(pools.nice),
    ...itemsArray(pools.junk),
  ];
};

export const addItem = (items: Items, item: string) => {
  items[item] = (items[item] || 0) + 1;
};

const removeItem = (items: Items, item: string) => {
  items[item] -= 1;
  if (items[item] === 0) {
    delete items[item];
  }
};

const removeItemPools = (pools: ItemPools, item: string) => {
  const keys = ['dungeon', 'required', 'nice', 'junk'] as const;
  for (const key of keys) {
    const items = pools[key];
    if (items[item]) {
      removeItem(items, item);
      return;
    }
  }
};

const maxRequired = (pools: ItemPools, item: string, count: number) => {
  if ((pools.required[item] || 0) <= count) {
    return;
  }
  const extra = pools.required[item] - count;
  pools.required[item] = count;
  pools.nice[item] = extra;
};

const combinedItems = (items: Items, other: Items) => {
  const combined: Items = {};
  for (const item in items) {
    combined[item] = items[item];
  }
  for (const item in other) {
    combined[item] = (combined[item] || 0) + other[item];
  }
  return combined;
};

class Solver {
  private placement: ItemPlacement = {};
  private items: Items = {};
  private reachable?: Reachable;
  private pools: ItemPools;
  private reachedLocations = new Set<string>();
  private fixedLocations = new Set<string>();
  private restrictedAssumed: Items = {};

  constructor(
    private opts: Options,
    private world: World,
    private random: Random,
  ) {
    this.fixLocations();
    this.pools = this.makeItemPools();
  }

  solve() {
    /* Fix the item pool */
    for (const item of EXTRA_ITEMS) {
      this.insertItem(item);
    }

    const checksCount = Object.keys(this.world.checks).length;

    /* Fix the GS tokens */
    this.fixTokens();
    this.fixFairies();

    /* Place the required reward items */
    this.fixRewards();

    /* Handle dungeon items */
    for (const dungeon in this.world.dungeons) {
      this.fixDungeon(dungeon);
    }

    for (;;) {
      for (;;) {
        this.reachable = pathfind(this.world, this.items, this.reachable);
        const changed = this.markAccessible();
        if (!changed) {
          break;
        }
      }

      if (this.reachable.locations.size === checksCount) {
        break;
      }

      /* We need to place a required item */
      this.randomAssumed(this.pools.required);
    }

    /* At this point we have a beatable game */
    this.fill();

    return this.placement;
  }

  private fixLocations() {
    if (!this.opts.settings.shuffleGerudoCard) {
      this.fixedLocations.add('OOT Gerudo Member Card');
    }

    if (this.opts.settings.ganonBossKey === 'vanilla') {
      this.fixedLocations.add('OOT Ganon Castle Boss Key');
    }
  }

  private makeItemPools() {
    const pools: ItemPools = { dungeon: {}, required: {}, nice: {}, junk: {} };

    for (const location in this.world.checks) {
      const check = this.world.checks[location];
      const { item } = check;

      if (this.fixedLocations.has(location)) {
        this.place(location, item);
        addItem(this.restrictedAssumed, item);
        continue;
      }

      if (ITEMS_DUNGEON.test(item) || ITEMS_DUNGEON_REWARDS.has(item)) {
        addItem(pools.dungeon, item);
      } else if (ITEMS_REQUIRED.has(item)) {
        addItem(pools.required, item);
      } else if (ITEMS_JUNK.has(item)) {
        addItem(pools.junk, item);
      } else {
        addItem(pools.nice, item);
      }
    }

    maxRequired(pools, 'OOT_SWORD', 2);
    maxRequired(pools, 'OOT_WALLET', 1);
    maxRequired(pools, 'OOT_BOMB_BAG', 1);
    maxRequired(pools, 'OOT_BOW', 1);
    maxRequired(pools, 'OOT_SLINGSHOT', 1);
    maxRequired(pools, 'OOT_MAGIC_UPGRADE', 1);
    maxRequired(pools, 'OOT_OCARINA', 1);
    maxRequired(pools, 'OOT_BOMBCHUS_10', 1);
    maxRequired(pools, 'OOT_GS_TOKEN', 50);

    maxRequired(pools, 'MM_SWORD', 1);
    maxRequired(pools, 'MM_BOMB_BAG', 1);
    maxRequired(pools, 'MM_BOW', 1);
    maxRequired(pools, 'MM_MAGIC_UPGRADE', 1);

    return pools;
  };

  private insertItem(item: string) {
    const junkItem = sample(this.random, itemsArray(this.pools.junk));
    removeItem(this.pools.junk, junkItem);
    addItem(this.pools.required, item);
  }

  private constraint(item: string) {
    return itemConstraint(item, this.opts.settings);
  }

  private fixTokens() {
    const setting = this.opts.settings.goldSkulltulaTokens;
    const shuffleInDungeons = ['dungeons', 'all'].includes(setting);
    const shuffleInOverworld = ['overworld', 'all'].includes(setting);
    const skullLocations = Object.keys(this.world.checks).filter(x => this.world.checks[x].item === 'OOT_GS_TOKEN');
    const dungeonLocations = Object.values(this.world.dungeons).reduce((acc, x) => new Set([...acc, ...x]));

    for (const location of skullLocations) {
      const isDungeon = dungeonLocations.has(location);
      if (!((isDungeon && shuffleInDungeons) || (!isDungeon && shuffleInOverworld))) {
        this.place(location, 'OOT_GS_TOKEN');
        removeItemPools(this.pools, 'OOT_GS_TOKEN');
      }
    }
  }

  private fixFairies() {
    for (const location in this.world.checks) {
      const check = this.world.checks[location];
      if (check.type === 'sf') {
        const item = check.item;
        this.place(location, item);
        removeItem(this.pools.dungeon, item);
      }
    }
  }

  private fixRewards() {
    let rewards: string[] = [];
    const locations: string[] = [];

    for (const location in this.world.checks) {
      const item = this.world.checks[location].item;
      if (ITEMS_DUNGEON_REWARDS.has(item)) {
        rewards.push(item);
        locations.push(location);
      }
    }

    rewards = shuffle(this.random, rewards);
    for (let i = 0; i < rewards.length; i++) {
      this.place(locations[i], rewards[i]);
      removeItem(this.pools.dungeon, rewards[i]);
    }
  }

  private fixDungeon(dungeon: string) {
    let reachable: Reachable | undefined = undefined;
    const assumed: Items = {};

    for (const game of GAMES) {
      for (const baseItem of ['SMALL_KEY', 'BOSS_KEY', 'STRAY_FAIRY', 'MAP', 'COMPASS']) {
        const item = gameId(game, baseItem + '_' + dungeon.toUpperCase(), '_');
        const locations = new Set(Array.from(this.world.dungeons[dungeon]).filter(loc => !this.placement[loc] && this.world.checks[loc].constraint === 'none'));
        while (this.pools.dungeon[item]) {
          reachable = this.randomRestricted(this.pools.dungeon, assumed, item, locations, reachable);
        }
      }
    }
  }

  private randomRestricted(pool: Items, assume: Items, item: string, locations: Set<string>, reachable?: Reachable) {
    const rewardsPool: Items = Array.from(ITEMS_DUNGEON_REWARDS).reduce((acc, x) => ({ ...acc, [x]: 1 }), {});
    const assumedItems = combinedItems(combinedItems(combinedItems(this.pools.required, assume), rewardsPool), this.restrictedAssumed);
    const assumedReachable = pathfind(this.world, assumedItems, reachable);

    let validLocations = Array.from(locations).filter(x => assumedReachable.locations.has(x)).filter(x => !this.placement[x]);

    const location = sample(this.random, validLocations);
    this.place(location, item);
    removeItem(pool, item);
    addItem(assume, item);

    return assumedReachable;
  }

  private randomAssumed(pool: Items) {
    /* Select a random item from the required pool */
    const requiredItem = sample(this.random, itemsArray(pool));

    /* Get the constraint associated with the item */
    const constraint = this.constraint(requiredItem);

    /* Remove the selected item from the required pool */
    removeItem(pool, requiredItem);

    /* Get all assumed accessible items */
    const assumedAccessibleItems = combinedItems(this.items, pool);

    /* Get all assumed reachable locations */
    let reachable = this.reachable!;
    const reachableLocations = new Set(reachable.locations);
    for (;;) {
      let changed = false;
      reachable = pathfind(this.world, assumedAccessibleItems, reachable);
      for (const l of reachable.locations.values()) {
        if (!reachableLocations.has(l)) {
          changed = true;
          reachableLocations.add(l);
          if (this.placement[l]) {
            addItem(assumedAccessibleItems, this.placement[l]);
          }
        }
      }
      if (!changed) {
        break;
      }
    }
    const assumedReachable = reachable.locations;

    /* Get all assumed reachable locations that have not been placed */
    const unplacedLocs = Array.from(assumedReachable)
      .filter(location => this.world.checks[location].constraint === constraint)
      .filter(location => !this.placement[location]);

    /* If there is nowhere to place an item, raise an error */
    if (unplacedLocs.length === 0) {
      throw new LogicSeedError(`No reachable locations for item ${requiredItem}`);
    }

    /* Select a random location from the assumed reachable locations */
    const location = sample(this.random, unplacedLocs);

    /* Place the selected item at the selected location */
    this.place(location, requiredItem);
  }

  private fill() {
    const pool = poolsArray(this.pools);
    const shuffledPool = shuffle(this.random, pool);
    const locations = Object.keys(this.world.checks).filter(loc => !this.placement[loc]);
    const locationsByConstraint = Object.fromEntries(CONSTRAINTS.map(c => [c, new Array<string>()]));

    /* Filter the locations */
    for (const loc of locations) {
      const constraint = this.world.checks[loc].constraint;
      locationsByConstraint[constraint].push(loc);
    }

    for (const item of shuffledPool) {
      const constraint = this.constraint(item);
      const loc = locationsByConstraint[constraint].pop()!;
      this.place(loc, item);
    }

    if (!Object.values(locationsByConstraint).every(x => x.length === 0)) {
      throw new Error('Item Count Error');
    }
  }

  private markAccessible() {
    let changed = false;
    this.reachable!.locations.forEach(loc => {
      if (this.placement[loc] && !this.reachedLocations.has(loc)) {
        this.reachedLocations.add(loc);
        const item = this.placement[loc];
        addItem(this.items, item);
        changed = true;
      }
    });
    return changed;
  }

  private place(location: string, item: string) {
    if (this.world.checks[location] === undefined) {
      throw new Error('Invalid Location: ' + location);
    }
    this.placement[location] = item;
  }
}

export const solve = (opts: Options, world: World, random: Random) => {
  const solver = new Solver(opts, world, random);
  return solver.solve();
}
