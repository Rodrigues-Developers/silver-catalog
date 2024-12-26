// src/app/firebase-storage.service.ts
import { Injectable } from "@angular/core";
import { initializeApp } from "firebase/app";
import { getStorage, FirebaseStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject, listAll } from "firebase/storage";
import firebaseConfig from "../../../../firebase_config.json";

@Injectable({
  providedIn: "root",
})
export class FirebaseStorageService {
  private storage: FirebaseStorage;

  constructor() {
    const app = initializeApp(firebaseConfig);
    this.storage = getStorage(app);
  }

  /**
   * Upload a file to Firebase Storage
   * @param path - Path in the storage bucket
   * @param file - File to upload
   * @returns Promise<string> - Download URL of the uploaded file
   */
  async uploadFile(path: string, file: File): Promise<string> {
    const storageRef = ref(this.storage, path);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        null,
        (error) => reject(error),
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        }
      );
    });
  }

  /**
   * Get the download URL of a file
   * @param path - Path in the storage bucket
   * @returns Promise<string> - Download URL
   */
  async getFileURL(path: string): Promise<string> {
    const storageRef = ref(this.storage, path);
    return getDownloadURL(storageRef);
  }

  /**
   * Delete a file from Firebase Storage
   * @param path - Path in the storage bucket
   * @returns Promise<void>
   */
  async deleteFile(path: string): Promise<void> {
    const storageRef = ref(this.storage, path);
    await deleteObject(storageRef);
  }

  /**
   * List all files in a specific directory
   * @param path - Directory path in the storage bucket
   * @returns Promise<string[]> - List of file paths
   */
  async listFiles(path: string): Promise<string[]> {
    const dirRef = ref(this.storage, path);
    const listResult = await listAll(dirRef);
    return listResult.items.map((itemRef) => itemRef.fullPath);
  }
}
