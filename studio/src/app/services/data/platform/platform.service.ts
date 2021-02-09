import {serverTimestamp} from 'firebase/firestore/lite';
import {collection, doc, setDoc} from 'firebase/firestore/lite';

import errorStore from '../../../stores/error.store';

import {Token} from '../../../models/data/token';
import {dbLite} from '../../../utils/editor/firestore.utils';

export class PlatformService {
  private static instance: PlatformService;

  private constructor() {
    // Private constructor, singleton
  }

  static getInstance() {
    if (!PlatformService.instance) {
      PlatformService.instance = new PlatformService();
    }
    return PlatformService.instance;
  }

  async merge(token: Token) {
    if (!token) {
      return;
    }

    try {
      token.data.updated_at = serverTimestamp();

      await setDoc(doc(collection(dbLite, 'tokens'), token.id), token.data, {merge: true});
    } catch (err) {
      errorStore.state.error = 'GitHub platform information not properly set up.';
    }
  }
}
