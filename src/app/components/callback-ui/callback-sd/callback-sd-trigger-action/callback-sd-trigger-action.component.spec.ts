import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CallbackSdTriggerActionComponent } from './callback-sd-trigger-action.component';

describe('CallbackSdTriggerActionComponent', () => {
  let component: CallbackSdTriggerActionComponent;
  let fixture: ComponentFixture<CallbackSdTriggerActionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CallbackSdTriggerActionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CallbackSdTriggerActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
