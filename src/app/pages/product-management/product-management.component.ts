import { CommonModule } from "@angular/common";
import { Component, OnInit, signal } from "@angular/core";
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from "@angular/forms";
import { ApiService } from "src/app/api.service";
import { Product } from "src/app/interfaces/products.interface";
import { Category } from "src/app/interfaces/category.interface";
import { CapitalizePipe } from "../../shared/pipes/capitalize.pipe";
import { MatIconModule } from "@angular/material/icon";
import { FirebaseStorageService } from "src/app/core/services/firebase-storage.service";
import { ToastrService } from "ngx-toastr"; // Import ToastrService
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

  constructor(
    private api: ApiService,
    private fb: FormBuilder,
    private storageService: FirebaseStorageService,
    private toastr: ToastrService // Inject ToastrService here
  ) {
    this.productForm = this.fb.group({
      name: ["", [Validators.required, Validators.minLength(2)]],
      description: [""],
      price: [0, [Validators.required, Validators.min(0)]],
      availability: [true, Validators.required],
      category: [""],
      image: [null], // Make this optional during edit
    });
  }

  ngOnInit(): void {
    this.fetchProducts();
    this.api.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (err) => {
        console.error("Failed to fetch categories", err);
      },
    });
  }

  fetchProducts() {
    this.api.getProducts().subscribe({
      next: (res) => (this.productsList = res as Product[]),
      error: (err) => console.error("Error fetching products:", err),
    });
  }

  onSubmitProductForm() {
    const product: Product = {
      ...this.productForm.value,
      category: this.selectedCategories.map((cat) => cat.id),
    };

    if (this.productForm.valid) {
      if (this.imageFile) {
        this.storageService
          .uploadFile("images/" + this.imageFile.name, this.imageFile)
          .then((url) => {
            product.image = url;
            this.saveProduct(product);
          })
          .catch((err) => {
            this.showToast("Erro ao fazer upload da imagem do produto.");
            console.error("Error uploading image:", err);
          });
      } else {
        this.saveProduct(product);
      }
    } else {
      console.error("Form is not valid");
    }
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
      image: product.image,
    });

    this.imagePreview = product.image || null;
    this.selectedCategories = [];
    for (const categoryID of product.category) {
      this.selectedCategories.push(getCategory(categoryID, this.categories));
    }
  }

  onDeleteProduct(product: Product) {
    if (confirm(`Tem certeza que gostaria de excluir o produto "${product.name}"?`)) {
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

      if (product.image) {
        this.storageService
          .deleteFile(product.image)
          .then(() => deleteProduct())
          .catch((err) => {
            this.showToast("Erro ao excluir a imagem do produto.");
            console.error("Error deleting image:", err);
          });
      } else {
        deleteProduct(); // No image to delete, proceed directly
      }
    }
  }

  saveProduct(product: Product) {
    if (this.editingProduct) {
      this.api.updateProduct(this.editingProductId!, product).subscribe({
        next: () => {
          this.fetchProducts();
          this.resetForm();
          this.showToast("Produto atualizado com sucesso!", true);
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
          console.error("Error updating product:", err);
          this.showToast("Erro ao atualizar o produto.");
        },
      });
    } else {
      this.api.createProduct(product).subscribe({
        next: () => {
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
    });
    this.editingProduct = false;
    this.editingProductId = null;
    this.imagePreview = null;
    this.imageFile = null;
    this.selectedCategories = [];
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
}
