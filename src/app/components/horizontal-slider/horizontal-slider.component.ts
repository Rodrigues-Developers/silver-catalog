import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatIconModule } from "@angular/material/icon";

@Component({
  selector: "app-horizontal-slider",
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: "./horizontal-slider.component.html",
  styleUrls: ["./horizontal-slider.component.less"],
})
export class HorizontalSliderComponent {
  @Input() items: { image: string }[] = [];
  currentIndex = 0;
  visibleItems = 4; // Number of visible items

  get maxIndex() {
    return Math.max(0, this.items.length - this.visibleItems);
  }

  nextSlide() {
    if (this.currentIndex < this.maxIndex) {
      this.currentIndex++;
    }
  }

  prevSlide() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    }
  }

  translateItems() {
    return `translateX(-${this.currentIndex * (80 / this.visibleItems)}%)`;
  }
}
