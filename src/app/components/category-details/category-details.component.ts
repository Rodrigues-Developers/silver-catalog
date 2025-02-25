import { Component } from "@angular/core";
import { SideBarComponent } from "../shared/side-bar/side-bar.component";
import { ProductListComponent } from "../product-list/product-list.component";
import { CategoryListComponent } from "../category-list/category-list.component";

@Component({
  selector: "app-category-details",
  standalone: true,
  imports: [SideBarComponent, ProductListComponent, CategoryListComponent],
  templateUrl: "./category-details.component.html",
  styleUrl: "./category-details.component.less",
})
export class CategoryDetailsComponent {}
