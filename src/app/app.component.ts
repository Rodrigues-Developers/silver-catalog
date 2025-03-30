import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { NavBarComponent } from "./components/shared/nav-bar/nav-bar.component";
import { FooterComponent } from "./components/shared/footer/footer.component";
import { CartComponent } from "./components/cart/cart.component";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.less"],
  standalone: true,
  imports: [RouterOutlet, NavBarComponent, FooterComponent, CartComponent],
})
export class AppComponent {}
