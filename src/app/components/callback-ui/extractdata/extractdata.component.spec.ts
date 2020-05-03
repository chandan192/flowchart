import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtractdataComponent } from './extractdata.component';

describe('ExtractdataComponent', () => {
  let component: ExtractdataComponent;
  let fixture: ComponentFixture<ExtractdataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExtractdataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExtractdataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
