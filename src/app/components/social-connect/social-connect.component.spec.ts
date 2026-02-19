import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SocialConnectComponent } from './social-connect.component';

describe('SocialConnectComponent', () => {
  let component: SocialConnectComponent;
  let fixture: ComponentFixture<SocialConnectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SocialConnectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SocialConnectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
