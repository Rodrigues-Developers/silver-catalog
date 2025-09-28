import { Component, Input, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { ApiService } from "src/app/api.service";
import { Category } from "src/app/interfaces/category.interface";
import { CapitalizePipe } from "../../shared/pipes/capitalize.pipe";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-category-list",
  standalone: true,
  imports: [CapitalizePipe, CommonModule],
  templateUrl: "./category-list.component.html",
  styleUrls: ["./category-list.component.less"],
})
export class CategoryListComponent implements OnInit {
  @Input() limit: number;
  @Input() sortBy: string;
  @Input() ascending: boolean;
  @Input() customClass?: string = "";
  hasApiError = false;
  categoryList: Category[];

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit(): void {
    this.api.getCategories({ sortBy: this.sortBy as keyof Category, ascending: this.ascending, limit: this.limit }).subscribe({
      next: (res) => {
        this.hasApiError = false;
        this.categoryList = res as Category[];
      },
      error: () => (this.hasApiError = true),
    });
  }

  navigateToCategoryDetails(category: Category) {
    this.router.navigate(["/category", category.id]);
  }
}
