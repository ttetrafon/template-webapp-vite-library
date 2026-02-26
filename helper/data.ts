const assetJsonData = import.meta.glob('../../assets/data/*.json');

////////////////
///   READ   ///
////////////////

export async function readAllJsonFiles(location: string): Promise<Record<string, unknown>> {
  let jsonData: Record<string, () => Promise<{ default: unknown }>> | null = null;

  switch(location) {
    case '../assets/data/':
      jsonData = assetJsonData as Record<string, () => Promise<{ default: unknown }>>;
      break;
    default:
      return {};
  }

  const allData: Record<string, unknown> = {};

  for (const path in jsonData) {
    const module = await jsonData[path]();
    const filename = path.split('/').pop()!.replace('.json', '');
    allData[filename] = module.default;
  }

  return allData;
}

////////////////////////
///   MANIPULATION   ///
////////////////////////

export function allCombinations(arr: string[][]): string[] {
  if (arr.length == 1) {
    return arr[0];
  } else {
    var result: string[] = [];
    var allCasesOfRest = allCombinations(arr.slice(1)); // recur with the rest of array
    for (var i = 0; i < allCasesOfRest.length; i++) {
      for (var j = 0; j < arr[0].length; j++) {
        result.push(arr[0][j] + "," + allCasesOfRest[i]);
      }
    }
    return result;
  }
}

export function checkStringForExistence(str: string | null | undefined): boolean {
  return !(str == undefined || str == null || str == "");
}
export function checkStringForNonExistence(str: string | null | undefined): boolean {
  return str == undefined || str == null || str == "";
}
