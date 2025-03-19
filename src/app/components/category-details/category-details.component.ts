import { Component, OnDestroy, OnInit } from "@angular/core";
import { SideBarComponent } from "../shared/side-bar/side-bar.component";
import { ProductListComponent } from "../product-list/product-list.component";
import { HorizontalSliderComponent } from "../horizontal-slider/horizontal-slider.component";
import { ApiService } from "src/app/api.service";
import { Category } from "src/app/interfaces/category.interface";
import { CapitalizePipe } from "../../shared/pipes/capitalize.pipe";
import { FilterService } from "../../core/services/filter.service";

@Component({
  selector: "app-category-details",
  standalone: true,
  imports: [SideBarComponent, ProductListComponent, HorizontalSliderComponent, CapitalizePipe],
  templateUrl: "./category-details.component.html",
  styleUrls: ["./category-details.component.less"],
})
export class CategoryDetailsComponent implements OnInit, OnDestroy {
  hasApiError = false;
  categoryList: Category[] = [];
  selectedItem: Category | null = null;

  constructor(private api: ApiService, private filterService: FilterService) {}

  ngOnInit(): void {
    this.fetchCategories();
  }
  ngOnDestroy(): void {
    this.filterService.resetFilters();
  }
  fetchCategories(): void {
    this.api.getCategories().subscribe({
      next: (res) => {
        this.hasApiError = false;
        this.categoryList = res as Category[];
      },
      error: () => (this.hasApiError = true),
    });
  }
  categorySelected() {
    const categoryId = window.location.href.split("/").pop();
    return this.categoryList.filter((category) => category.id === categoryId)[0]?.name;
  }

  onItemClick(item: any) {
    if (this.selectedItem === item) {
      this.selectedItem = null;
      return;
    }
    this.selectedItem = item as Category;
  }
}
