import { Component, AfterViewInit, ElementRef } from "@angular/core";
import { MatIconModule } from "@angular/material/icon";

@Component({
  selector: "app-social-connect",
  standalone: true,
  imports: [MatIconModule],
  templateUrl: "./social-connect.component.html",
  styleUrl: "./social-connect.component.less",
})
export class SocialConnectComponent implements AfterViewInit {
  constructor(private el: ElementRef) {}

  socialLinks = [
    { icon: "photo_camera", label: "Instagram", url: "https://www.instagram.com/ags_prata_925" },
    { icon: "smartphone", label: "WhatsApp", url: "https://wa.me/559591428927" },
  ];

  open(url: string) {
    window.open(url, "_blank");
  }

  ngAfterViewInit(): void {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("show");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 },
    );

    const elements = this.el.nativeElement.querySelectorAll(".fade-in");
    elements.forEach((el: Element) => observer.observe(el));
  }
}
