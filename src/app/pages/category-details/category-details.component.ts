import { Component, OnDestroy, OnInit } from "@angular/core";
import { SideBarComponent } from "../../components/shared/side-bar/side-bar.component";
import { ProductListComponent } from "../../components/product-list/product-list.component";
import { HorizontalSliderComponent } from "../../components/horizontal-slider/horizontal-slider.component";
import { ApiService } from "src/app/api.service";
import { Category } from "src/app/interfaces/category.interface";
import { CapitalizePipe } from "../../shared/pipes/capitalize.pipe";
import { FilterService } from "../../core/services/filter.service";
import { LoadingComponent } from "../../components/shared/loading/loading.component";
import { MatIcon } from "@angular/material/icon";
import { handleTranstition } from "src/app/utils/animation";

@Component({
  selector: "app-category-details",
  standalone: true,
  imports: [SideBarComponent, ProductListComponent, HorizontalSliderComponent, CapitalizePipe, LoadingComponent, MatIcon],
  templateUrl: "./category-details.component.html",
  styleUrls: ["./category-details.component.less"],
})
export class CategoryDetailsComponent implements OnInit, OnDestroy {
  hasApiError = false;
  categoryList: Category[] = [];
  selectedItem: Category | null = null;
  selectedCategoryName: string;
  loading = true;
  showFilter = false;

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
        const categoryId = window.location.href.split("/").pop();
        this.selectedItem = this.categoryList.filter((category) => category.id === categoryId)[0];
        this.selectedCategoryName = this.selectedItem?.name || "";
        this.loading = false;
        window.scrollTo(0, 0);
      },
      error: () => (this.hasApiError = true),
    });
  }

  onItemClick(item: any) {
    if (this.selectedItem === item) {
      this.selectedItem = null;
      return;
    }
    this.selectedItem = item as Category;
    this.selectedCategoryName = item.name;
  }

  toggleFilter(element: HTMLElement) {
    this.showFilter = !this.showFilter;

    handleTranstition(element);
  }
}
