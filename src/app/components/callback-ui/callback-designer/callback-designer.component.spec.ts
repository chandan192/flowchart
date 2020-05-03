import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CallbackDesignerComponent } from './callback-designer.component';

describe('CallbackDesignerComponent', () => {
  let component: CallbackDesignerComponent;
  let fixture: ComponentFixture<CallbackDesignerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CallbackDesignerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CallbackDesignerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
