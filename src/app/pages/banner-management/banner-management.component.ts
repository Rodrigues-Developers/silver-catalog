import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from "@angular/forms";
import { MatIconModule } from "@angular/material/icon";
import { ToastrService } from "ngx-toastr"; // Import ToastrService
import { FirebaseStorageService } from "src/app/core/services/firebase-storage.service";
import { ApiService } from "src/app/api.service";
import { Banner } from "src/app/interfaces/banner.interface";

@Component({
  selector: "app-banner-management",
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, MatIconModule],
  templateUrl: "./banner-management.component.html",
  styleUrls: ["./banner-management.component.less"],
})
export class BannerManagementComponent implements OnInit {
  bannersList: Banner[] = [];
  bannerForm: FormGroup;
  editingBanner = false;
  editingBannerId: string | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  imageFile: File | null = null;
  oldImage: string | null = null;

  constructor(
    private api: ApiService,
    private fb: FormBuilder,
    private storageService: FirebaseStorageService,
    private toastr: ToastrService // Inject ToastrService here
  ) {
    this.bannerForm = this.fb.group({
      image: [null], // Make this optional during edit
    });
  }

  ngOnInit(): void {
    this.fetchBanners();
  }

  fetchBanners() {
    this.api.getBanners().subscribe({
      next: (res) => (this.bannersList = res as Banner[]),
      error: (err) => console.error("Error fetching banners:", err),
    });
  }

  onSubmitBannerForm() {
    if (this.bannerForm.valid) {
      const banner: Banner = {
        ...this.bannerForm.value,
      };

      if (this.imageFile) {
        this.storageService
          .uploadFile("images/" + this.imageFile.name, this.imageFile)
          .then((url) => {
            banner.image = url;
            this.saveBanner(banner);
          })
          .catch((err) => {
            this.showToast("Erro ao fazer upload da imagem do banner.");
            console.error("Error uploading image:", err);
          });
      } else {
        this.saveBanner(banner);
      }
    } else {
      console.error("Form is not valid");
    }
  }

  onEditBanner(banner: Banner) {
    this.editingBanner = true;
    this.editingBannerId = banner.id;
    this.oldImage = banner.image;

    this.imagePreview = banner.image || null;
  }

  onDeleteBanner(banner: Banner) {
    if (confirm(`Tem certeza que gostaria de excluir o banner "${banner.id}"?`)) {
      const deleteBanner = () => {
        this.api.deleteBanner(banner.id).subscribe({
          next: () => {
            this.fetchBanners();
            this.showToast("Banner excluído com sucesso!", true);
          },
          error: (err) => {
            console.error("Error deleting banner:", err);
            this.showToast("Erro ao excluir o banner.");
          },
        });
      };

      if (banner.image) {
        this.storageService
          .deleteFile(banner.image)
          .then(() => deleteBanner())
          .catch((err) => {
            this.showToast("Erro ao excluir a imagem do banner.");
            console.error("Error deleting image:", err);
          });
      } else {
        deleteBanner(); // No image to delete, proceed directly
      }
    }
  }

  saveBanner(banner: Banner) {
    if (this.editingBanner) {
      this.api.updateBanner(this.editingBannerId!, banner).subscribe({
        next: () => {
          this.fetchBanners();
          this.resetForm();
          this.showToast("Banner atualizado com sucesso!", true);
          this.storageService
            .deleteFile(this.oldImage)
            .then(() => {
              this.resetForm();
            })
            .catch((err) => {
              console.error("Error deleting old image:", err);
            });
        },
        error: (err) => {
          console.error("Error updating banner:", err);
          this.showToast("Erro ao atualizar o banner.");
        },
      });
    } else {
      this.api.createBanner(banner).subscribe({
        next: () => {
          this.fetchBanners();
          this.showToast("Banner criado com sucesso!", true);
        },
        error: (err) => {
          console.error("Error creating banner:", err);
          this.showToast("Erro ao criar o banner.");
        },
      });
    }
  }

  cancelEdit() {
    this.resetForm();
  }

  private resetForm() {
    this.bannerForm.reset({
      image: null,
    });
    this.editingBanner = false;
    this.editingBannerId = null;
    this.imagePreview = null;
    this.imageFile = null;
  }

  onImageChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input?.files?.length) {
      this.imageFile = input.files[0];
      this.bannerForm.patchValue({ image: this.imageFile });

      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(this.imageFile);
    }
  }

  // Show toast message using ngx-toastr
  showToast(message: string, type?: boolean) {
    if (type) {
      this.toastr.success(message, "", { timeOut: 3000 });
    } else {
      this.toastr.error(message, "", { timeOut: 3000 });
    }
  }
}
