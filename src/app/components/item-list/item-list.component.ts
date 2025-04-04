import { Component, EventEmitter, Input, Output } from "@angular/core";
import { CommonModule } from "@angular/common";
import { CapitalizePipe } from "../../shared/pipes/capitalize.pipe";

@Component({
  selector: "app-item-list",
  standalone: true,
  imports: [CommonModule, CapitalizePipe],
  templateUrl: "./item-list.component.html",
  styleUrls: ["./item-list.component.less"],
})
export class ItemListComponent {
  @Input() items: any[] = [];
  @Input() extraFields: string[] = [];
  @Output() itemClicked = new EventEmitter<any>();

  onItemClicked(item: any) {
    this.itemClicked.emit(item);
  }
}
