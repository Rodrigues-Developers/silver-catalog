import { Component, OnDestroy, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { ActivatedRoute, RouterModule } from "@angular/router";
import { MatIconModule } from "@angular/material/icon";
import { CommonModule } from "@angular/common";
import { AuthService } from "src/app/core/services/auth.service";
import { User } from "firebase/auth";
import { Subscription } from "rxjs";
import { Order } from "src/app/interfaces/order.interface";
import { ApiService } from "src/app/api.service";

@Component({
  standalone: true,
  selector: "app-order",
  imports: [MatIconModule, CommonModule, RouterModule],
  templateUrl: "./order.component.html",
  styleUrls: ["./order.component.less"],
})
export class OrderComponent implements OnInit, OnDestroy {
  orders: Order[] | null = null;
  orderId: string | null = null;
  currentUser: User | null = null;
  currentUserSubscription: Subscription;

  constructor(private http: HttpClient, private route: ActivatedRoute, private authService: AuthService, private api: ApiService) {}

  ngOnInit(): void {
    this.orderId = this.route.snapshot.paramMap.get("id");
    this.currentUserSubscription = this.authService.user$.subscribe((user) => {
      this.currentUser = user;
      this.fetchOrder();
    });
  }

  fetchOrder(): void {
    this.api.getOrders("createdAt").subscribe({
      next: (res) => {
        this.orders = res as Order[];
      },
      error: (err) => console.error("Error fetching orders:", err),
    });
  }

  ngOnDestroy(): void {
    this.currentUserSubscription.unsubscribe();
  }
}
