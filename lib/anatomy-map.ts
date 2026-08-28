import type { MuscleId } from "@/lib/exercise-library";

export type AnatomyRegion = {
  x: number;
  y: number;
  width: number;
  height: number;
  rotate?: number;
};

const pair = (left: AnatomyRegion, right: AnatomyRegion): AnatomyRegion[] => [left, right];

export const anatomyRegions: Record<MuscleId, AnatomyRegion[]> = {
  pectoralisMajor: [{ x: 25.5, y: 25, width: 9, height: 5 }],
  upperChest: [{ x: 26, y: 22.5, width: 8, height: 3.5 }],
  latissimusDorsi: [{ x: 65, y: 29, width: 10, height: 14 }],
  trapezius: [{ x: 66, y: 18, width: 8, height: 11 }],
  anteriorDeltoid: pair({ x: 21, y: 22.5, width: 4.5, height: 5.5, rotate: 18 }, { x: 34.5, y: 22.5, width: 4.5, height: 5.5, rotate: -18 }),
  lateralDeltoid: pair({ x: 20.5, y: 23, width: 4, height: 6, rotate: 18 }, { x: 35.5, y: 23, width: 4, height: 6, rotate: -18 }),
  posteriorDeltoid: pair({ x: 60.5, y: 22.5, width: 4.5, height: 5.5, rotate: 18 }, { x: 75, y: 22.5, width: 4.5, height: 5.5, rotate: -18 }),
  biceps: pair({ x: 20, y: 30, width: 3.8, height: 8, rotate: 8 }, { x: 36.2, y: 30, width: 3.8, height: 8, rotate: -8 }),
  triceps: pair({ x: 59.8, y: 30, width: 3.8, height: 9, rotate: 8 }, { x: 76.3, y: 30, width: 3.8, height: 9, rotate: -8 }),
  forearms: [
    ...pair({ x: 18.8, y: 39, width: 3.5, height: 10, rotate: 8 }, { x: 37.6, y: 39, width: 3.5, height: 10, rotate: -8 }),
    ...pair({ x: 58.6, y: 39, width: 3.5, height: 10, rotate: 8 }, { x: 78, y: 39, width: 3.5, height: 10, rotate: -8 }),
  ],
  rectusAbdominis: [{ x: 27.2, y: 33, width: 5.6, height: 14 }],
  obliques: pair({ x: 24.5, y: 34.5, width: 3.2, height: 12, rotate: 8 }, { x: 32.3, y: 34.5, width: 3.2, height: 12, rotate: -8 }),
  erectorSpinae: [{ x: 67.3, y: 30.5, width: 5.4, height: 18 }],
  gluteusMaximus: pair({ x: 63.5, y: 48, width: 7, height: 9, rotate: 8 }, { x: 70.5, y: 48, width: 7, height: 9, rotate: -8 }),
  quadriceps: pair({ x: 22.5, y: 52, width: 7, height: 20, rotate: 3 }, { x: 30.5, y: 52, width: 7, height: 20, rotate: -3 }),
  hamstrings: pair({ x: 62.5, y: 57, width: 6.5, height: 18, rotate: 2 }, { x: 71, y: 57, width: 6.5, height: 18, rotate: -2 }),
  adductors: pair({ x: 27, y: 54, width: 4, height: 17, rotate: 2 }, { x: 30.5, y: 54, width: 4, height: 17, rotate: -2 }),
  abductors: pair({ x: 61.5, y: 51, width: 4.5, height: 10, rotate: 8 }, { x: 75, y: 51, width: 4.5, height: 10, rotate: -8 }),
  calves: [
    ...pair({ x: 23.5, y: 74, width: 5.2, height: 17, rotate: 2 }, { x: 31.5, y: 74, width: 5.2, height: 17, rotate: -2 }),
    ...pair({ x: 63.5, y: 75, width: 5.2, height: 16, rotate: 2 }, { x: 71.5, y: 75, width: 5.2, height: 16, rotate: -2 }),
  ],
};
