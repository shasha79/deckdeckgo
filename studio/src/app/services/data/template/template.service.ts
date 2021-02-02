import {
  DocumentReference,
  QuerySnapshot,
  QueryDocumentSnapshot,
  addDoc,
  collection,
  serverTimestamp,
  where,
  orderBy,
  query,
  getDocs,
  setDoc,
  doc,
} from 'firebase/firestore/lite';

import templatesStore from '../../../stores/templates.store';
import authStore from '../../../stores/auth.store';

import {Template, TemplateData} from '../../../models/data/template';
import {db} from '../../../utils/editor/firestore.utils';

export class TemplateService {
  private static instance: TemplateService;

  private constructor() {
    // Private constructor, singleton
  }

  static getInstance() {
    if (!TemplateService.instance) {
      TemplateService.instance = new TemplateService();
    }
    return TemplateService.instance;
  }

  async init() {
    if (!authStore.state.authUser || authStore.state.authUser.anonymous) {
      return;
    }

    if (templatesStore.state.user?.length > 0) {
      return;
    }

    try {
      const templates: Template[] = await this.getUserTemplates();

      if (!templates) {
        return undefined;
      }

      templatesStore.state.user = [...templates];
    } catch (err) {
      console.error(err);
    }
  }

  private getUserTemplates(): Promise<Template[]> {
    return new Promise<Template[]>(async (resolve, reject) => {
      try {
        const userId: string = authStore.state.authUser.uid;

        const snapshot: QuerySnapshot = await getDocs(query(collection(db, 'templates'), where('owner_id', '==', userId), orderBy('updated_at', 'desc')));

        const templates: Template[] = snapshot.docs.map((documentSnapshot: QueryDocumentSnapshot) => {
          return {
            id: documentSnapshot.id,
            data: documentSnapshot.data() as TemplateData,
          };
        });

        resolve(templates);
      } catch (err) {
        reject(err);
      }
    });
  }

  create(templateData: TemplateData): Promise<Template> {
    return new Promise<Template>(async (resolve, reject) => {
      const now = serverTimestamp();
      templateData.created_at = now;
      templateData.updated_at = now;

      try {
        const doc: DocumentReference = await addDoc(collection(db, 'templates'), templateData);

        resolve({
          id: doc.id,
          data: templateData,
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  update(template: Template): Promise<Template> {
    return new Promise<Template>(async (resolve, reject) => {
      const now = serverTimestamp();
      template.data.updated_at = now;

      try {
        await setDoc(doc(collection(db, 'templates'), template.id), template.data, {merge: true});

        resolve(template);
      } catch (err) {
        reject(err);
      }
    });
  }
}
