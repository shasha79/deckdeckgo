import {collection, serverTimestamp, deleteDoc, DocumentSnapshot, getDoc, doc, setDoc} from 'firebase/firestore/lite';

import store from '../../../stores/user.store';

import {AuthUser} from '../../../models/auth/auth.user';
import {User, UserData} from '../../../models/data/user';
import {dbLite} from '../../../utils/editor/firestore.utils';

export class UserService {
  private static instance: UserService;

  private constructor() {
    // Private constructor, singleton
  }

  static getInstance() {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  create(authUser: AuthUser): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      if (!authUser || !authUser.uid) {
        reject('Authentication user not defined.');
        return;
      }

      try {
        const snapshot: DocumentSnapshot = await getDoc(doc(collection(dbLite, 'users'), authUser.uid));

        if (!snapshot.exists) {
          const user: User = await this.createUser(authUser);

          store.state.user = {...user};
        } else {
          const user: UserData = snapshot.data() as UserData;

          const updatedUser: UserData = await this.updateUserWithAuthData(authUser, user);

          store.state.user = {
            id: authUser.uid,
            data: updatedUser,
          };
        }

        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }

  private createUser(authUser: AuthUser): Promise<User> {
    return new Promise<User>(async (resolve, reject) => {
      try {
        const now = serverTimestamp();

        const user: UserData = {
          anonymous: authUser.anonymous,
          newsletter: true,
          created_at: now,
          updated_at: now,
        };

        if (authUser.name) {
          user.name = authUser.name;
        }

        if (authUser.email) {
          user.email = authUser.email;
          user.newsletter = true;
        }

        if (authUser.photo_url) {
          user.photo_url = authUser.photo_url;
        }

        await setDoc(doc(collection(dbLite, 'users'), authUser.uid), user, {merge: true});

        resolve({
          id: authUser.uid,
          data: user,
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  private updateUserWithAuthData(authUser: AuthUser, user: UserData): Promise<UserData> {
    return new Promise<UserData>(async (resolve, reject) => {
      try {
        if (this.userNeedUpdate(authUser, user)) {
          if (user.anonymous !== authUser.anonymous) {
            user.anonymous = authUser.anonymous;
          }

          if (!user.name && authUser.name) {
            user.name = authUser.name;
          }

          if (!user.email && authUser.email) {
            user.email = authUser.email;
          }

          if (!user.photo_url && authUser.photo_url) {
            user.photo_url = authUser.photo_url;
          }

          user.updated_at = serverTimestamp();

          await setDoc(doc(collection(dbLite, 'users'), authUser.uid), user, {merge: true});
        }

        resolve(user);
      } catch (err) {
        reject(err);
      }
    });
  }

  private userNeedUpdate(authUser: AuthUser, user: UserData): boolean {
    if (user.anonymous !== authUser.anonymous) {
      return true;
    } else if (!user.name && authUser.name) {
      return true;
    } else if (!user.email && authUser.email) {
      return true;
    } else if (!user.photo_url && authUser.photo_url) {
      return true;
    } else {
      return false;
    }
  }

  update(user: User): Promise<User> {
    return new Promise<User>(async (resolve, reject) => {
      const now = serverTimestamp();
      user.data.updated_at = now;

      try {
        await setDoc(doc(collection(dbLite, 'users'), user.id), user.data, {merge: true});

        store.state.user = {...user};

        resolve(user);
      } catch (err) {
        reject(err);
      }
    });
  }

  delete(userId: string): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        await deleteDoc(doc(collection(dbLite, 'users'), userId));

        store.reset();

        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }
}
