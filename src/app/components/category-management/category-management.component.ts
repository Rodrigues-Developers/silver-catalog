import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from "@angular/forms";
import { ApiService } from "src/app/api.service";
import { Category } from "src/app/interfaces/category.interface";
import { MatIconModule } from "@angular/material/icon";
import { ToastrService } from "ngx-toastr"; // Import ToastrService
import { FirebaseStorageService } from "src/app/core/services/firebase-storage.service";
import { CapitalizePipe } from "src/app/shared/pipes/capitalize.pipe";

@Component({
  selector: "app-category-management",
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, MatIconModule, CapitalizePipe],
  templateUrl: "./category-management.component.html",
  styleUrls: ["./category-management.component.less"],
})
export class CategoryManagementComponent implements OnInit {
  categoriesList: Category[] = [];
  categoryForm: FormGroup;
  editingCategory = false;
  editingCategoryId: string | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  imageFile: File | null = null;
  oldImage: string | null = null;

  constructor(
    private api: ApiService,
    private fb: FormBuilder,
    private storageService: FirebaseStorageService,
    private toastr: ToastrService // Inject ToastrService here
  ) {
    this.categoryForm = this.fb.group({
      name: ["", [Validators.required, Validators.minLength(2)]],
      image: [null], // Make this optional during edit
      description: [""],
    });
  }

  ngOnInit(): void {
    this.fetchCategories();
  }

  fetchCategories() {
    this.api.getCategories().subscribe({
      next: (res) => (this.categoriesList = res as Category[]),
      error: (err) => console.error("Error fetching categories:", err),
    });
  }

  onSubmitCategoryForm() {
    if (this.categoryForm.valid) {
      const category: Category = {
        ...this.categoryForm.value,
      };

      if (this.imageFile) {
        this.storageService
          .uploadFile("images/" + this.imageFile.name, this.imageFile)
          .then((url) => {
            category.image = url;
            this.saveCategory(category);
          })
          .catch((err) => {
            this.showToast("Erro ao fazer upload da imagem da categoria.");
            console.error("Error uploading image:", err);
          });
      } else {
        this.saveCategory(category);
      }
    } else {
      console.error("Form is not valid");
    }
  }

  onEditCategory(category: Category) {
    this.editingCategory = true;
    this.editingCategoryId = category.id;
    this.oldImage = category.image;

    this.categoryForm.patchValue({
      name: category.name,
      description: category.description,
    });

    this.imagePreview = category.image || null;
  }

  onDeleteCategory(category: Category) {
    if (confirm(`Tem certeza que gostaria de excluir a categoria "${category.name}"?`)) {
      this.api.checkIfProductHasCategory(category.id).subscribe((exists) => {
        if (exists) {
          this.showToast("Não é possível excluir uma categoria com produtos associados.");
          return;
        }

        const deleteCategory = () => {
          this.api.deleteCategory(category.id).subscribe({
            next: () => {
              this.fetchCategories();
              this.showToast("Categoria excluída com sucesso!", true);
            },
            error: (err) => {
              console.error("Error deleting category:", err);
              this.showToast("Erro ao excluir a categoria.");
            },
          });
        };

        if (category.image) {
          this.storageService
            .deleteFile(category.image)
            .then(() => deleteCategory())
            .catch((err) => {
              this.showToast("Erro ao excluir a imagem da categoria.");
              console.error("Error deleting image:", err);
            });
        } else {
          deleteCategory(); // No image to delete, proceed directly
        }
      });
    }
  }

  saveCategory(category: Category) {
    if (this.categoryForm.invalid) {
      console.error("Form is not valid");
      return;
    }

    // Flag to check if image changed
    const isImageUpdated = !!this.imageFile;

    if (this.editingCategory) {
      this.api.updateCategory(this.editingCategoryId!, category).subscribe({
        next: () => {
          this.fetchCategories();
          this.showToast("Categoria atualizada com sucesso!", true);

          // ✅ Delete old image **only if the user uploaded a new one**
          if (isImageUpdated && this.oldImage && category.image !== this.oldImage) {
            this.storageService.deleteFile(this.oldImage).catch((err) => {
              console.error("Error deleting old image:", err);
            });
          }

          this.resetForm();
        },
        error: (err) => {
          console.error("Error updating category:", err);
          this.showToast("Erro ao atualizar a categoria.");
        },
      });
    } else {
      this.api.createCategory(category).subscribe({
        next: () => {
          this.fetchCategories();
          this.showToast("Categoria criada com sucesso!", true);
        },
        error: (err) => {
          console.error("Error creating category:", err);
          this.showToast("Erro ao criar a categoria.");
        },
      });
    }
  }

  cancelEdit() {
    this.resetForm();
  }

  private resetForm() {
    this.categoryForm.reset({
      name: "",
      image: null,
    });
    this.editingCategory = false;
    this.editingCategoryId = null;
    this.imagePreview = null;
    this.imageFile = null;
  }

  onImageChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input?.files?.length) {
      this.imageFile = input.files[0];
      this.categoryForm.patchValue({ image: this.imageFile });

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
