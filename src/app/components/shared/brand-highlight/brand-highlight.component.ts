import { Component, ElementRef, ViewChild, AfterViewInit } from "@angular/core";

@Component({
  selector: "app-brand-highlight",
  standalone: true,
  templateUrl: "./brand-highlight.component.html",
  styleUrl: "./brand-highlight.component.less",
})
export class BrandHighlightComponent implements AfterViewInit {
  @ViewChild("sectionRef") sectionRef!: ElementRef;

  isVisible = false;

  stats = [
    { value: "100%", label: "Prata" },
    { value: "+1.000", label: "Clientes satisfeitos" },
    { value: "Alta", label: "Durabilidade" },
  ];

  ngAfterViewInit() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.isVisible = true;
            observer.disconnect();
          }
        });
      },
      { threshold: 0.2 },
    );

    observer.observe(this.sectionRef.nativeElement);
  }
}
