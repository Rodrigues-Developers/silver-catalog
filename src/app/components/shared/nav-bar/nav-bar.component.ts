import { Component, Inject, OnInit, OnDestroy } from "@angular/core";
import { AuthService } from "@auth0/auth0-angular";
import { Subscription } from "rxjs";
import { CommonModule } from "@angular/common";
import { faUser, faPowerOff } from "@fortawesome/free-solid-svg-icons";
import { AsyncPipe, DOCUMENT, } from "@angular/common";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { NgbCollapse } from "@ng-bootstrap/ng-bootstrap";
import { RouterLink } from "@angular/router";
import { MatIconModule } from "@angular/material/icon";

@Component({
  selector: "app-nav-bar",
  templateUrl: "./nav-bar.component.html",
  styleUrls: ["./nav-bar.component.less"],
  standalone: true,
  imports: [FontAwesomeModule, MatIconModule, NgbCollapse, AsyncPipe, RouterLink, CommonModule],
})
export class NavBarComponent implements OnInit, OnDestroy {
  isCollapsed = true;
  userCollapsed = true;
  faUser = faUser;
  faPowerOff = faPowerOff;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any;
  private userSubscription: Subscription;

  constructor(public auth: AuthService, @Inject(DOCUMENT) private doc: Document) {}

  ngOnInit(): void {
    this.userSubscription = this.auth.user$.subscribe((user) => {
      this.user = user;
    });
  }
  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
  }
  loginWithRedirect() {
    this.auth.loginWithRedirect();
  }

  logout() {
    this.auth.logout({ logoutParams: { returnTo: this.doc.location.origin } });
  }
}
