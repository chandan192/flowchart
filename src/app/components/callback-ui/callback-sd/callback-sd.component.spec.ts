import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CallbackSdComponent } from './callback-sd.component';

describe('CallbackSdComponent', () => {
  let component: CallbackSdComponent;
  let fixture: ComponentFixture<CallbackSdComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CallbackSdComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CallbackSdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
