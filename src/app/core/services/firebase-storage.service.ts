import { Injectable } from "@angular/core";
import { initializeApp } from "firebase/app";
import { getStorage, FirebaseStorage, ref, getDownloadURL, deleteObject, listAll } from "firebase/storage";
import { AuthService } from "./auth.service";
import { User } from "firebase/auth";
import { v4 as uuidv4 } from "uuid";
import { environment } from "../../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class FirebaseStorageService {
  firebaseConfig = environment.firebase;
  private storage: FirebaseStorage;
  user: User | null = null; // Start user as null to reflect auth state properly

  constructor(private authService: AuthService) {
    const app = initializeApp(this.firebaseConfig);
    this.storage = getStorage(); // Uses already initialized app from main.ts
    this.authService.user$.subscribe((user) => {
      this.user = user; // Update user state when auth state changes
    });
  }

  /**
   * Compress an image file to ensure it's under 1MB without losing too much quality
   * @param file - Original image file
   * @param maxSizeMB - Maximum size in MB (default: 1MB)
   * @returns Promise<File> - Compressed image file
   */
  async compressImage(file: File, maxSizeMB = 1): Promise<File> {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;

        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          if (!ctx) {
            reject(new Error("Failed to get canvas context"));
            return;
          }

          let width = img.width;
          let height = img.height;

          // Scale down if needed
          const scaleFactor = Math.sqrt(maxSizeBytes / file.size);
          if (scaleFactor < 1) {
            width = Math.round(img.width * scaleFactor);
            height = Math.round(img.height * scaleFactor);
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          let quality = 0.9; // Start with high quality
          const mimeType = file.type === "image/png" ? "image/png" : "image/jpeg";

          const tryCompress = () => {
            canvas.toBlob(
              (blob) => {
                if (blob && blob.size > maxSizeBytes && quality > 0.1) {
                  quality -= 0.1; // Reduce quality
                  tryCompress(); // Retry compression
                } else if (blob) {
                  resolve(new File([blob], file.name, { type: mimeType }));
                } else {
                  reject(new Error("Compression failed"));
                }
              },
              mimeType,
              quality
            );
          };

          tryCompress();
        };
      };

      reader.onerror = (error) => reject(error);
    });
  }

  /**
   * Upload a file to Firebase Storage
   * @param path - Path in the storage bucket
   * @param file - File to upload
   * @returns Promise<string> - Download URL of the uploaded file
   */
  async uploadFile(path: string, file: File): Promise<string> {
    const compressedFile = await this.compressImage(file, 1); // Compress before upload
    const uniqueFileName = `${uuidv4()}_${compressedFile.name}`;
    const firebaseUrl = `https://firebasestorage.googleapis.com/v0/b/${this.firebaseConfig.storageBucket}/o?name=${encodeURIComponent(path + uniqueFileName)}`;

    const response = await fetch(firebaseUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${await this.user.getIdToken()}`,
        "Content-Type": compressedFile.type,
      },
      body: compressedFile,
    });

    if (!response.ok) {
      throw new Error("Failed to upload file to Firebase Storage");
    }

    // Parse the JSON response to get the download URL
    const responseBody = await response.json();
    const downloadURL = `https://firebasestorage.googleapis.com/v0/b/${this.firebaseConfig.storageBucket}/o/${encodeURIComponent(responseBody.name)}?alt=media`;

    return downloadURL;
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
   * @param fileUrl - File url to delete
   * @returns Promise<void>
   */
  async deleteFile(fileUrl: string): Promise<void> {
    const response = await fetch(fileUrl, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${await this.user.getIdToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to delete file from Firebase Storage");
    }
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
