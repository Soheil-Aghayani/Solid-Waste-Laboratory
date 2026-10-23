// SheetJS (xlsx 0.20.3, Apache-2.0) is about 1 MB, so it is loaded only when someone imports an Excel file.
let loading;

/** Resolves to the SheetJS module ({ read, utils, ... }). Concurrent and later calls share one load. */
export function loadSheetJS() {
  loading ??= import('./vendor/xlsx.mjs?v=1').catch(() => {
    loading = undefined; // allow a retry, for example after the connection returns
    throw new Error('Unable to load the spreadsheet reader. Check your connection and try again.');
  });
  return loading;
}
