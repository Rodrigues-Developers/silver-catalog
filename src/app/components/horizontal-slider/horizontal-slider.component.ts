import { Component, Input, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatIconModule } from "@angular/material/icon";

@Component({
  selector: "app-horizontal-slider",
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: "./horizontal-slider.component.html",
  styleUrls: ["./horizontal-slider.component.less"],
})
export class HorizontalSliderComponent implements OnInit {
  @Input() items: { image: string }[] = [];
  @Input() visibleItems = 4;
  @Input() itemWidth = 100;
  @Input() itemWidthUnit: "vw" | "px" = "px";
  @Input() itemHeight = 100;
  @Input() translateDistance = 80;
  @Input() maxWidth = 530;
  @Input() maxWidthUnit: "vw" | "px" = "px";
  currentIndex = 0;

  ngOnInit(): void {
    this.autoSlide();
  }

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
    return `translateX(-${this.currentIndex * (this.translateDistance / this.visibleItems)}%)`;
  }

  getMaxWidth() {
    return `${this.maxWidth}${this.maxWidthUnit}`;
  }

  getWidth() {
    return `${this.itemWidth}${this.maxWidthUnit}`;
  }

  autoSlide() {
    setInterval(() => {
      if (this.currentIndex === this.maxIndex) {
        this.currentIndex = -1;
      }
      this.nextSlide();
    }, 9000);
  }
}
