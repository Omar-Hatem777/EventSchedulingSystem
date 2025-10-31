import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResponseSelectorComponent } from './response-selector.component';

describe('ResponseSelectorComponent', () => {
  let component: ResponseSelectorComponent;
  let fixture: ComponentFixture<ResponseSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResponseSelectorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResponseSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
