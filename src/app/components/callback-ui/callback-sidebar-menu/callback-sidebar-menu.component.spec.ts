import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CallbackSidebarMenuComponent } from './callback-sidebar-menu.component';

describe('CallbackSidebarMenuComponent', () => {
  let component: CallbackSidebarMenuComponent;
  let fixture: ComponentFixture<CallbackSidebarMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CallbackSidebarMenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CallbackSidebarMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
