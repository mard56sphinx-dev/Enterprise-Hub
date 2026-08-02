import { parseCSVOrText, FileMeta } from './csvParser';
import { parseExcel } from './excelParser';
import { parseJSON } from './jsonParser';
import { parseZIP } from './zipParser';
import { parseSQL } from './sqlParser';
import { parseXML } from './xmlParser';

export async function parseFile(
  file: File,
  fileId: number,
  meta: FileMeta,
  onProgress: (processedBytes: number, totalRecords: number) => void
): Promise<number> {
  const ext = file.name.split('.').pop()?.toLowerCase() || '';

  if (ext === 'xlsx' || ext === 'xls') {
    return await parseExcel(file, fileId, meta, onProgress);
  } else if (ext === 'json') {
    return await parseJSON(file, fileId, meta, onProgress);
  } else if (ext === 'zip') {
    return await parseZIP(file, fileId, meta, onProgress);
  } else if (ext === 'sql') {
    return await parseSQL(file, fileId, meta, onProgress);
  } else if (ext === 'xml') {
    return await parseXML(file, fileId, meta, onProgress);
  } else {
    // CSV, TXT, TSV, or any uncompressed binary/text stream fallback
    return await parseCSVOrText(file, fileId, meta, onProgress);
  }
}
