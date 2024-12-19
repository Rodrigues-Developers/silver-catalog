import { Component, Inject } from "@angular/core";
import { CommonModule } from '@angular/common';
import { AuthService } from "@auth0/auth0-angular";
import { faUser, faPowerOff } from "@fortawesome/free-solid-svg-icons";
import { AsyncPipe, DOCUMENT, NgIf } from "@angular/common";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { RouterLink } from "@angular/router";
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-side-bar',
  standalone: true,
  imports: [FontAwesomeModule, MatIconModule, AsyncPipe, NgIf, RouterLink, CommonModule,],
  templateUrl: './side-bar.component.html',
  styleUrl: './side-bar.component.less'
})
export class SideBarComponent {
  isCollapsed = true;
  faUser = faUser;
  faPowerOff = faPowerOff;

  constructor(public auth: AuthService, @Inject(DOCUMENT) private doc: Document) {}
  
  loginWithRedirect() {
    this.auth.loginWithRedirect();
  }

  logout() {
    this.auth.logout({ logoutParams: { returnTo: this.doc.location.origin } });
  }
}
