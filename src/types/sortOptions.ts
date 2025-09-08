export enum SortOption {
  Basic = 'basic',
  Shared = 'shared',
  Daily = 'daily',
}

export const SortOptionLabels: Record<SortOption, string> = {
  [SortOption.Basic]: 'Highest basic income',
  [SortOption.Shared]: 'Highest shared bonus',
  [SortOption.Daily]: 'Highest daily bonus',
};
