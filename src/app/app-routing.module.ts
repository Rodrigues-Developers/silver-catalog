import { Routes } from "@angular/router";
import { HomeComponent } from "./pages/home/home.component";
import { ProfileComponent } from "./pages/profile/profile.component";
import { ExternalApiComponent } from "./pages/external-api/external-api.component";
import { ErrorComponent } from "./pages/error/error.component";
import { ProductManagementComponent } from "./pages/product-management/product-management.component";
import { AuthGuard } from "../app/core/guards/auth.guard"; // Import your custom AuthGuard
import { ProductDetailsComponent } from "./components/product-details/product-details.component";

export const routes: Routes = [
  { path: "", component: HomeComponent },
  {
    path: "product/:id", // Dynamic route with "id" as a parameter
    component: ProductDetailsComponent,
    canActivate: [AuthGuard], // Protect the route with AuthGuard if needed
  },
  {
    path: "category/:id", // Dynamic route with "id" as a parameter
    component: ProductDetailsComponent,
    canActivate: [AuthGuard], // Protect the route with AuthGuard if needed
  },
  {
    path: "profile",
    component: ProfileComponent,
    canActivate: [AuthGuard], // Apply the custom AuthGuard
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
  { path: "error", component: ErrorComponent },
  { path: "**", redirectTo: "", pathMatch: "full" },
];
