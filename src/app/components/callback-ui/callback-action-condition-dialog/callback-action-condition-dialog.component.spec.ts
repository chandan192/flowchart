import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CallbackActionConditionDialogComponent } from './callback-action-condition-dialog.component';

describe('CallbackActionConditionDialogComponent', () => {
  let component: CallbackActionConditionDialogComponent;
  let fixture: ComponentFixture<CallbackActionConditionDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CallbackActionConditionDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CallbackActionConditionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
