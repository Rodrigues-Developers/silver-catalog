import { Routes } from "@angular/router";
import { HomeComponent } from "./pages/home/home.component";
import { ProfileComponent } from "./pages/profile/profile.component";
import { ExternalApiComponent } from "./pages/external-api/external-api.component";
import { ErrorComponent } from "./pages/error/error.component";
import { ProductManagementComponent } from "./pages/product-management/product-management.component";
import { AuthGuard } from "../app/core/guards/auth.guard"; // Import your custom AuthGuard
import { ProductDetailsComponent } from "./components/product-details/product-details.component";
import { CategoryManagementComponent } from "./components/category-management/category-management.component";
import { CategoryDetailsComponent } from "./components/category-details/category-details.component";

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
    path: "profile",
    component: ProfileComponent,
    canActivate: [AuthGuard], // Protect the route with AuthGuard if needed
  },
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
  { path: "error", component: ErrorComponent },
  { path: "**", redirectTo: "", pathMatch: "full" },
];
