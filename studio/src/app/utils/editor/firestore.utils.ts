import {initializeApp} from 'firebase/app';
import {deleteField} from 'firebase/firestore';
import {getFirestore} from 'firebase/firestore/lite';
import {getStorage} from 'firebase/storage';
import {getAuth} from 'firebase/auth';

import {EnvironmentConfigService} from '../../services/core/environment/environment-config.service';

const firebaseApp = initializeApp(EnvironmentConfigService.getInstance().get('firebase'));
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
export const storage = getStorage(firebaseApp);

export class FirestoreUtils {
  static filterDelete<T>(obj: T, replaceWithNull: boolean = false): T {
    if (typeof obj !== 'object' || Array.isArray(obj)) {
      return obj;
    }

    return Object.keys(obj)
      .filter((key) => !this.shouldAttributeBeCleaned(obj[key]))
      .reduce((res, key) => {
        const value: T = this.filterDelete(obj[key]);

        if (value && typeof value === 'object') {
          // We don't want to keep empty leaf {}
          if (Object.keys(value).length > 0) {
            res[key] = value;
          } else if (replaceWithNull) {
            res[key] = null;
          }
        } else {
          res[key] = value;
        }

        return res;
      }, {} as T);
  }

  static shouldAttributeBeCleaned<T>(attr: T): boolean {
    // If attr is a not an object (string, number or boolean) for sure it isn't a Firestore FieldValue.delete
    if (typeof attr !== 'object' || Array.isArray(attr)) {
      return false;
    }

    return JSON.stringify(attr) === JSON.stringify(deleteField());
  }
}
