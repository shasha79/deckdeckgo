import {uploadBytesResumable, ref, getDownloadURL, list, ListResult, ListOptions, StorageReference} from 'firebase/storage';

import errorStore from '../../stores/error.store';
import authStore from '../../stores/auth.store';

import {Constants} from '../../types/core/constants';
import {storage} from '../../utils/editor/firestore.utils';

export class StorageOnlineService {
  private static instance: StorageOnlineService;

  static getInstance() {
    if (!StorageOnlineService.instance) {
      StorageOnlineService.instance = new StorageOnlineService();
    }
    return StorageOnlineService.instance;
  }

  uploadFile(data: File, folder: string, maxSize: number): Promise<StorageFile | null> {
    return new Promise<StorageFile>(async (resolve) => {
      try {
        if (!authStore.state.authUser || !authStore.state.authUser.uid || authStore.state.authUser.uid === '' || authStore.state.authUser.uid === undefined) {
          errorStore.state.error = 'Not logged in.';
          resolve(null);
          return;
        }

        if (!data || !data.name) {
          errorStore.state.error = 'File not valid.';
          resolve(null);
          return;
        }

        if (data.size > maxSize) {
          errorStore.state.error = `File is too big (max. ${maxSize / 1048576} Mb)`;
          resolve(null);
          return;
        }

        const imageRef: StorageReference = ref(storage, `${authStore.state.authUser.uid}/assets/${folder}/${data.name}`);

        const snapshot = await uploadBytesResumable(imageRef, data);

        resolve({
          downloadUrl: await getDownloadURL(snapshot.ref),
          fullPath: imageRef.fullPath,
          name: ref.name,
        });
      } catch (err) {
        errorStore.state.error = err.message;
        resolve(null);
      }
    });
  }

  getFiles(next: string | null, folder: string): Promise<StorageFilesList | null> {
    return new Promise<StorageFilesList | null>(async (resolve) => {
      try {
        if (!authStore.state.authUser || !authStore.state.authUser.uid || authStore.state.authUser.uid === '' || authStore.state.authUser.uid === undefined) {
          errorStore.state.error = 'Not logged in.';
          resolve(null);
          return;
        }

        const filesRef: StorageReference = ref(storage, `${authStore.state.authUser.uid}/assets/${folder}/`);

        let options: ListOptions = {
          maxResults: Constants.STORAGE.MAX_QUERY_RESULTS,
        };

        if (next) {
          options.pageToken = next;
        }

        const results: ListResult = await list(filesRef, options);

        resolve(this.toStorageFileList(results));
      } catch (err) {
        resolve(null);
      }
    });
  }

  private toStorageFileList(results: ListResult): Promise<StorageFilesList> {
    return new Promise<StorageFilesList>(async (resolve) => {
      if (!results || !results.items || results.items.length <= 0) {
        resolve({
          items: [],
          nextPageToken: null,
        });
        return;
      }

      const storageFiles: Promise<StorageFile>[] = results.items.map(this.toStorageFile);
      const items: StorageFile[] = await Promise.all(storageFiles);

      resolve({
        items: items,
        nextPageToken: results.nextPageToken,
      });
    });
  }

  private toStorageFile(ref: StorageReference): Promise<StorageFile> {
    return new Promise<StorageFile>(async (resolve) => {
      resolve({
        downloadUrl: await getDownloadURL(ref),
        fullPath: ref.fullPath,
        name: ref.name,
      });
    });
  }
}
