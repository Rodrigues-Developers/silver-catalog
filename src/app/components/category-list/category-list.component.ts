import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { ApiService } from "src/app/api.service";
import { Category } from "src/app/interfaces/category.interface";
import { CapitalizePipe } from "../../shared/pipes/capitalize.pipe";

@Component({
  selector: "app-category-list",
  standalone: true,
  imports: [CapitalizePipe],
  templateUrl: "./category-list.component.html",
  styleUrls: ["./category-list.component.less"],
})
export class CategoryListComponent {
  hasApiError = false;
  categoryList: Category[];

  constructor(private api: ApiService, private router: Router) {
    this.api.getCategories().subscribe({
      next: (res) => {
        this.hasApiError = false;
        this.categoryList = res as Category[];
      },
      error: () => (this.hasApiError = true),
    });
  }

  navigateToProductDetails(category: Category) {
    this.router.navigate(["/category", category.id]);
  }
}
