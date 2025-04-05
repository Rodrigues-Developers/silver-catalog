import { Routes } from "@angular/router";
import { HomeComponent } from "./pages/home/home.component";
import { ProfileComponent } from "./pages/profile/profile.component";
import { ExternalApiComponent } from "./pages/external-api/external-api.component";
import { ErrorComponent } from "./pages/error/error.component";
import { ProductManagementComponent } from "./pages/admin/product-management/product-management.component";
import { AuthGuard } from "../app/core/guards/auth.guard"; // Import your custom AuthGuard
import { ProductDetailsComponent } from "./pages/product-details/product-details.component";
import { CategoryManagementComponent } from "./pages/admin/category-management/category-management.component";
import { CategoryDetailsComponent } from "./pages/category-details/category-details.component";
import { BannerManagementComponent } from "./pages/banner-management/banner-management.component";
import { OrderComponent } from "./pages/order/order.component";

export const routes: Routes = [
  { path: "", component: HomeComponent },
  {
    path: "product/:id", // Dynamic route with "id" as a parameter
    component: ProductDetailsComponent,
  },
  {
    path: "category/:id", // Dynamic route with "id" as a parameter
    component: CategoryDetailsComponent,
  },
  {
    path: "orders/:id", // Order details
    component: OrderComponent,
    data: { role: "role" },
    canActivate: [AuthGuard],
  },
  // {
  //   path: "profile",
  //   component: ProfileComponent,
  //   canActivate: [AuthGuard], // Protect the route with AuthGuard if needed
  // },
  {
    path: "external-api",
    component: ExternalApiComponent,
    canActivate: [AuthGuard], // Apply the custom AuthGuard
  },
  {
    path: "product-management",
    component: ProductManagementComponent,
    data: { role: "role" }, // Admin-only page
    canActivate: [AuthGuard], // Apply the custom AuthGuard
  },
  {
    path: "category-management",
    component: CategoryManagementComponent,
    data: { role: "role" }, // Admin-only page
    canActivate: [AuthGuard], // Apply the custom AuthGuard
  },
  {
    path: "banner-management",
    component: BannerManagementComponent,
    data: { role: "role" }, // Admin-only page
    canActivate: [AuthGuard], // Apply the custom AuthGuard
  },
  { path: "error", component: ErrorComponent },
  { path: "**", redirectTo: "", pathMatch: "full" },
];
