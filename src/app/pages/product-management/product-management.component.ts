import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from "@angular/forms";
import { ApiService } from "src/app/api.service";
import { Product } from "src/app/interfaces/products.interface";
import { CapitalizePipe } from "../../shared/pipes/capitalize.pipe";
import { MatIconModule } from "@angular/material/icon";

@Component({
  selector: "app-product-management",
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, CapitalizePipe, MatIconModule],
  templateUrl: "./product-management.component.html",
  styleUrl: "./product-management.component.less",
})
export class ProductManagementComponent {
  productsList: Product[] = [];
  productForm: FormGroup;
  editingProduct = false;
  editingProductId: string | null = null;

  constructor(private api: ApiService, private fb: FormBuilder) {
    this.productForm = this.fb.group({
      name: ["", [Validators.required, Validators.minLength(2)]],
      description: [""],
      price: [0, [Validators.required, Validators.min(0)]],
      availability: [true, Validators.required],
      category: [""],
    });

    this.fetchProducts();
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
      category: this.productForm.value.category ? this.productForm.value.category.split(",").map((c: string) => c.trim()) : [],
    };

    if (this.editingProduct) {
      this.api.updateProduct(this.editingProductId!, product).subscribe({
        next: () => {
          this.fetchProducts();
          this.resetForm();
        },
        error: (err) => console.error("Error updating product:", err),
      });
    } else {
      this.api.createProduct(product).subscribe({
        next: () => {
          this.fetchProducts();
          this.resetForm();
        },
        error: (err) => console.error("Error creating product:", err),
      });
    }
  }

  onEditProduct(product: Product) {
    this.editingProduct = true;
    this.editingProductId = product.id;
    this.productForm.patchValue({
      name: product.name,
      description: product.description,
      price: product.price,
      availability: product.availability,
      category: product.category.join(", "),
    });
  }

  onDeleteProduct(product: Product) {
    if (confirm(`Tem certeza que gostaria de excluir o produto "${product.name}"?`)) {
      this.api.deleteProduct(product.id).subscribe({
        next: () => this.fetchProducts(),
        error: (err) => console.error("Error deleting product:", err),
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
  }
}
