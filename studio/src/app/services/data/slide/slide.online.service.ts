import {DocumentReference, addDoc, collection, serverTimestamp, deleteDoc, DocumentSnapshot, getDoc, doc, setDoc} from 'firebase/firestore/lite';

import {Slide, SlideData} from '../../../models/data/slide';
import {db} from '../../../utils/editor/firestore.utils';

export class SlideOnlineService {
  private static instance: SlideOnlineService;

  private constructor() {
    // Private constructor, singleton
  }

  static getInstance() {
    if (!SlideOnlineService.instance) {
      SlideOnlineService.instance = new SlideOnlineService();
    }
    return SlideOnlineService.instance;
  }

  create(deckId: string, slide: SlideData): Promise<Slide> {
    return new Promise<Slide>(async (resolve, reject) => {
      const now = serverTimestamp();
      slide.created_at = now;
      slide.updated_at = now;

      try {
        const doc: DocumentReference = await addDoc(collection(db, `/decks/${deckId}/slides`), slide);

        resolve({
          id: doc.id,
          data: slide,
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  get(deckId: string, slideId: string): Promise<Slide> {
    return new Promise<Slide>(async (resolve, reject) => {
      try {
        const snapshot: DocumentSnapshot = await getDoc(doc(collection(db, `/decks/${deckId}/slides`), slideId));

        if (!snapshot.exists) {
          reject('Slide not found');
          return;
        }

        const slide: SlideData = snapshot.data() as SlideData;

        resolve({
          id: snapshot.id,
          data: slide,
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  update(deckId: string, slide: Slide): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      const now = serverTimestamp();
      slide.data.updated_at = now;

      try {
        await setDoc(doc(collection(db, `/decks/${deckId}/slides`), slide.id), slide.data, {merge: true});

        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }

  delete(deckId: string, slideId: string): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        await deleteDoc(doc(collection(db, `/decks/${deckId}/slides`), slideId));

        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }
}
