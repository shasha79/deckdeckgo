import {DocumentSnapshot, doc, getDoc, setDoc, collection, serverTimestamp} from 'firebase/firestore/lite';

import {Deck, DeckData} from '../../../models/data/deck';
import {dbLite, FirestoreUtils} from '../../../utils/editor/firestore.utils';

export class DeckOnlineService {
  private static instance: DeckOnlineService;

  private constructor() {
    // Private constructor, singleton
  }

  static getInstance() {
    if (!DeckOnlineService.instance) {
      DeckOnlineService.instance = new DeckOnlineService();
    }
    return DeckOnlineService.instance;
  }

  get(deckId: string): Promise<Deck> {
    return new Promise<Deck>(async (resolve, reject) => {
      try {
        const snapshot: DocumentSnapshot = await getDoc(doc(collection(dbLite, 'decks'), deckId));

        if (!snapshot.exists) {
          reject('Deck not found');
          return;
        }

        const deck: DeckData = snapshot.data() as DeckData;

        resolve({
          id: snapshot.id,
          data: deck,
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  update(deck: Deck): Promise<Deck> {
    return new Promise<Deck>(async (resolve, reject) => {
      const now = serverTimestamp();
      deck.data.updated_at = now;

      try {
        await setDoc(doc(collection(dbLite, 'decks'), deck.id), deck.data, {merge: true});

        resolve(FirestoreUtils.filterDelete(deck));
      } catch (err) {
        reject(err);
      }
    });
  }
}
