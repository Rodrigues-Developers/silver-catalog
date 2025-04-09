import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
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
  @Input() itemWidth = 100;
  @Input() itemWidthUnit: "vw" | "px" = "px";
  @Input() itemHeight = 100;
  @Input() maxWidth = 530;
  @Input() maxWidthUnit: "vw" | "px" = "px";
  @Input() autoSlider = true;
  @Output() itemClicked = new EventEmitter<any>();
  currentIndex = 0;

  ngOnInit(): void {
    this.autoSlide();
  }

  get maxIndex() {
    return Math.max(0, this.items.length - 1);
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
    return `translateX(calc(-${this.currentIndex * this.itemWidth}${this.itemWidthUnit} - ${this.currentIndex * 10}px))`;
  }

  getMaxWidth(): string {
    return `min(${this.maxWidth}${this.maxWidthUnit}, calc(100vw - 5px))`;
  }

  getWidth() {
    return `${this.itemWidth}${this.itemWidthUnit}`;
  }

  autoSlide() {
    if (this.autoSlider) {
      setInterval(() => {
        if (this.currentIndex === this.maxIndex) {
          this.currentIndex = -1;
        }
        this.nextSlide();
      }, 9000);
    }
  }

  onItemClicked(item: any) {
    this.itemClicked.emit(item);
  }
}
