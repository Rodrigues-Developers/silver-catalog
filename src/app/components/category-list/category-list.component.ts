import { Component } from "@angular/core";

@Component({
  selector: "app-category-list",
  standalone: true,
  imports: [],
  templateUrl: "./category-list.component.html",
  styleUrls: ["./category-list.component.less"],
})
export class CategoryListComponent {
  categories = ["Pulseira", "Colar", "Anel", "Brinco"];
}
