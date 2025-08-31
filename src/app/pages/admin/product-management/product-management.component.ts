import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from "@angular/forms";
import { ApiService } from "src/app/api.service";
import { Product } from "src/app/interfaces/products.interface";
import { Category } from "src/app/interfaces/category.interface";
import { CapitalizePipe } from "src/app/shared/pipes/capitalize.pipe";
import { MatIconModule } from "@angular/material/icon";
import { FirebaseStorageService } from "src/app/core/services/firebase-storage.service";
import { ToastrService } from "ngx-toastr";
import { getCategory } from "src/app/utils/category";

@Component({
  selector: "app-product-management",
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, CapitalizePipe, MatIconModule],
  templateUrl: "./product-management.component.html",
  styleUrls: ["./product-management.component.less"],
})
export class ProductManagementComponent implements OnInit {
  productsList: Product[] = [];
  productForm: FormGroup;
  categories: Category[] = [];
  selectedCategories: Category[] = [];
  editingProduct = false;
  editingProductId: string | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  imageFile: File | null = null;
  oldImage: string | null = null;
  showCategorySelect = false;
  editingIndex: number | null = null;
  editName = "";
  additionalImageFiles: File[] = []; // Store files to upload later
  additionalImagesPreview: string[] = []; // Store previews
  originalAdditionalImages: string[] = []; // Store original additional images
  additionalImagesToDelete: string[] = [];
  currentProduct: Product | null = null;
  discountValues: number[] = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95]; // Discount values from 0% to 95%
  loading = false;

  constructor(private api: ApiService, private fb: FormBuilder, private storageService: FirebaseStorageService, private toastr: ToastrService) {
    this.productForm = this.fb.group({
      name: ["", [Validators.required, Validators.minLength(2)]],
      description: [""],
      price: [0, [Validators.required, Validators.min(0)]],
      availability: [true, Validators.required],
      category: [""],
      image: [null],
      additionalImages: this.fb.array([null, null, null]), // Array of three possible additional images
      discount: [0], // Set the initial value of the discount to 0
    });
  }

  ngOnInit(): void {
    this.fetchProducts();
    this.api.getCategories().subscribe({
      next: (categories) => (this.categories = categories),
      error: (err) => console.error("Failed to fetch categories", err),
    });
  }

  fetchProducts() {
    this.api.getProducts().subscribe({
      next: (res) => (this.productsList = res as Product[]),
      error: (err) => console.error("Error fetching products:", err),
    });
  }

  onSubmitProductForm() {
    if (this.productForm.invalid) {
      this.showToast("Formulário inválido. Verifique os campos obrigatórios.");
      this.loading = false;
      return;
    }
    this.loading = true;

    const product: Product = {
      ...this.productForm.value,
      category: this.selectedCategories.map((cat) => cat.id),
    };

    const uploadAdditionalImages = this.additionalImageFiles.map((file) => {
      if (file) {
        return this.storageService.uploadFile(`products/${file.name}`, file);
      }
      return Promise.resolve(null); // If no file is selected, resolve with null
    });

    Promise.all(uploadAdditionalImages)
      .then((urls) => {
        this.deleteAdditionalImages().then(() => {
          product.additionalImages = urls;
          const isImageUpdated = !!this.imageFile;
          if (this.currentProduct?.additionalImages) {
            const updatedAdditionalImages = this.currentProduct.additionalImages.map((url, index) => (urls[index] !== undefined ? urls[index] : url));

            product.additionalImages = updatedAdditionalImages;
          }

          if (isImageUpdated && this.editingProduct) {
            // if editing and image updated, upload new main image
            return this.storageService
              .uploadFile("products/" + this.imageFile.name, this.imageFile)
              .then((url) => {
                product.image = url;
                this.saveProduct(product);
              })
              .catch((err) => {
                this.showToast("Erro ao fazer upload da imagem do produto.");
                console.error("Error uploading image:", err);
              });
          }
          return this.saveProduct(product);
        });
      })
      .catch((err) => {
        this.showToast("Erro ao fazer upload das imagens adicionais.");
        console.error("Error uploading additional images:", err);
      });
  }

  onEditProduct(product: Product) {
    this.editingProduct = true;
    this.editingProductId = product.id;
    this.oldImage = product.image;

    this.productForm.patchValue({
      name: product.name,
      description: product.description,
      price: product.price,
      availability: product.availability,
      category: product.category,
      discount: product.discount,
    });

    this.imagePreview = product.image || null;
    this.selectedCategories = [];
    for (const categoryID of product.category) {
      this.selectedCategories.push(getCategory(categoryID, this.categories));
    }

    this.additionalImagesPreview = product?.additionalImages || [];
    this.additionalImagesToDelete = [];
    this.currentProduct = product;

    // Scroll to top of the page
    setTimeout(() => {
      const formNameElement = document.getElementById("description");
      if (formNameElement) {
        formNameElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);
  }

  onDeleteProduct(product: Product) {
    if (confirm(`Tem certeza que gostaria de excluir o produto "${product.name}"?`)) {
      const promises: Promise<void>[] = [];

      if (product.image) {
        promises.push(
          this.storageService.deleteFile(product.image).catch((err) => {
            this.showToast("Erro ao excluir a imagem do produto.");
            console.error("Error deleting image:", err);
          })
        );
      }

      if (product.additionalImages) {
        for (const additionalImage of product.additionalImages) {
          promises.push(
            this.storageService.deleteFile(additionalImage).catch((err) => {
              this.showToast("Erro ao excluir a imagem adicional do produto.");
              console.error("Error deleting additional image:", err);
            })
          );
        }
      }

      Promise.all(promises)
        .then(() => deleteProduct())
        .catch(() => {
          this.showToast("Erro ao excluir as imagens.");
          console.error("Error deleting images.");
        });

      const deleteProduct = () => {
        this.api.deleteProduct(product.id).subscribe({
          next: () => {
            this.fetchProducts();
            this.showToast("Produto excluído com sucesso!", true);
          },
          error: (err) => {
            console.error("Error deleting product:", err);
            this.showToast("Erro ao excluir o produto.");
          },
        });
      };
    }
  }

  saveProduct(product: Product) {
    const isImageUpdated = !!this.imageFile;

    if (this.editingProduct) {
      this.api.updateProduct(this.editingProductId!, product).subscribe({
        next: () => {
          this.fetchProducts();
          this.showToast("Produto atualizado com sucesso!", true);

          if (isImageUpdated && this.oldImage && product.image !== this.oldImage) {
            this.storageService.deleteFile(this.oldImage).catch((err) => {
              console.error("Error deleting old image:", err);
            });
          }

          this.resetForm();
        },
        error: (err) => {
          console.error("Error updating product:", err);
          this.showToast("Erro ao atualizar o produto.");
        },
      });
    } else {
      // save the main image
      if (isImageUpdated) {
        this.storageService
          .uploadFile("products/" + this.imageFile.name, this.imageFile)
          .then((url) => {
            product.image = url;
            this.createProduct(product);
          })
          .catch((err) => {
            this.showToast("Erro ao fazer upload da imagem do produto.");
            console.error("Error uploading image:", err);
          });
      } else {
        // no image to upload, just create the product
        this.createProduct(product);
      }
    }
  }

  cancelEdit() {
    this.resetForm();
  }

  private resetForm() {
    this.productForm.reset({
      name: "",
      description: "",
      price: 0,
      availability: true,
      category: "",
      discount: 0,
    });
    this.editingProduct = false;
    this.editingProductId = null;
    this.imagePreview = null;
    this.imageFile = null;
    this.selectedCategories = [];
    this.additionalImageFiles = []; // Reset additional images
    this.additionalImagesPreview = []; // Reset additional images previews
    this.loading = false;
  }

  onImageChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input?.files?.length) {
      this.imageFile = input.files[0];
      this.productForm.patchValue({ image: this.imageFile });

      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(this.imageFile);
    }
  }

  // Handle the additional image changes
  onAdditionalImageChange(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input?.files?.length) {
      const file = input.files[0];
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        this.additionalImagesPreview[index] = e.target?.result as string;
      };
      fileReader.readAsDataURL(file);

      // Update form control
      const additionalImagesControl = this.productForm.controls["additionalImages"] as FormArray;
      additionalImagesControl.at(index).setValue(file);

      // Store selected file for uploading later
      this.additionalImageFiles[index] = file;
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

  addCategory(categoryId: string): void {
    const category = getCategory(categoryId, this.categories);
    if (category && !this.selectedCategories.includes(category)) {
      this.selectedCategories.push(category);
    }
  }

  removeCategory(index: number): void {
    this.selectedCategories.splice(index, 1);
  }

  startEdit(index: number, category: string): void {
    this.editingIndex = index;
    this.editName = category;
  }

  saveEdit(index: number): void {
    if (this.editName.trim()) {
      this.selectedCategories[index].name = this.editName.trim();
    }
    this.editingIndex = null;
  }

  showProductCategoryName(categoryListIDs: string[]): string {
    const categoryNameList: string[] = [];
    for (const catID of categoryListIDs) {
      categoryNameList.push(getCategory(catID, this.categories)?.name || "");
    }
    return categoryNameList.join(", ");
  }

  removeAdditonalImage(index: number): void {
    // If the image already exists, add to the list of images to delete
    if (this.additionalImagesPreview[index]?.includes("firebasestorage.googleapis.com")) {
      this.additionalImagesToDelete.push(this.additionalImagesPreview[index]);
    }
    // Reset the form control and file array
    const additionalImagesControl = this.productForm.controls["additionalImages"] as FormArray;
    additionalImagesControl.at(index).setValue(null);
    this.additionalImageFiles[index] = null;

    // Reset the actual file input element
    const fileInput = document.getElementById("additionalImage" + index) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }

    // remove the preview
    this.additionalImagesPreview.splice(index, 1, "");
  }

  deleteAdditionalImages(): Promise<void[]> {
    const promises: Promise<void>[] = [];
    for (const imageURL of this.additionalImagesToDelete) {
      promises.push(this.storageService.deleteFile(imageURL));
    }
    return Promise.all(promises);
  }

  createProduct(product: Product) {
    this.api.createProduct(product).subscribe({
      next: () => {
        this.resetForm();
        this.fetchProducts();
        this.showToast("Produto criado com sucesso!", true);
      },
      error: (err) => {
        console.error("Error creating product:", err);
        this.showToast("Erro ao criar o produto.");
      },
    });
  }
}
