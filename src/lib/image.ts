import { Directory, File, Paths } from 'expo-file-system';
import { Platform } from 'react-native';

import { makeId } from '@/lib/id';

export async function persistScanImage(sourceUri: string, scanId?: string): Promise<string> {
  if (Platform.OS === 'web' || !sourceUri.startsWith('file://')) {
    return sourceUri;
  }

  try {
    const directory = new Directory(Paths.document, 'scans');
    if (!directory.exists) {
      directory.create({ intermediates: true });
    }

    const extension = new File(sourceUri).extension || '.jpg';
    const destination = new File(directory, `${scanId ?? makeId('scan')}${extension}`);
    await new File(sourceUri).copy(destination);
    return destination.uri;
  } catch (error) {
    console.warn('Could not persist scan image', error);
    return sourceUri;
  }
}

export function deleteScanImage(uri?: string) {
  if (!uri || Platform.OS === 'web' || !uri.startsWith('file://')) {
    return;
  }

  try {
    const file = new File(uri);
    if (file.exists) {
      file.delete();
    }
  } catch (error) {
    console.warn('Could not delete scan image', error);
  }
}
