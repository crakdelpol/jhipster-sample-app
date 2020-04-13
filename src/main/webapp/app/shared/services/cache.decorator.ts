const readLocalStorageObject = (storeKey: string) => {
  return JSON.parse(window.localStorage.getItem(storeKey) || '{}');
};

export function Cache({ pool }: { pool: string }): any {
  return (target: any, key: string) => {
    Object.defineProperty(target, key, {
      get: () => readLocalStorageObject(pool)[key],
      set: (value: string) =>
        window.localStorage.setItem(
          pool,
          JSON.stringify({
            ...readLocalStorageObject(pool),
            [key]: value
          })
        )
    });
  };
}
