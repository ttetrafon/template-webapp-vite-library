const assetJsonData = import.meta.glob('../../assets/data/*.json');

////////////////
///   READ   ///
////////////////

/**
 *
 * @param {String} location
 * @returns
 */
export async function readAllJsonFiles(location) {
  let jsonData = null;

  switch(location) {
    case '../assets/data/':
      jsonData = assetJsonData;
      break;
    default:
      return {};
  }

  const allData = {};

  for (const path in jsonData) {
    const module = await jsonData[path]();
    const filename = path.split('/').pop().replace('.json', '');
    allData[filename] = module.default;
  }

  return allData;
}

////////////////////////
///   MANIPULATION   ///
////////////////////////

export function allCombinations(arr) {
  if (arr.length == 1) {
    return arr[0];
  } else {
    var result = [];
    var allCasesOfRest = allCombinations(arr.slice(1)); // recur with the rest of array
    for (var i = 0; i < allCasesOfRest.length; i++) {
      for (var j = 0; j < arr[0].length; j++) {
        result.push(arr[0][j] + "," + allCasesOfRest[i]);
      }
    }
    return result;
  }
}

export function checkStringForExistence(str) {
  return !(str == undefined || str == null || str == "");
}
export function checkStringForNonExistence(str) {
  return str == undefined || str == null || str == "";
}
