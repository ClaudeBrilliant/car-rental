import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HotelDashboard } from './hotel-dashboard';

describe('HotelDashboard', () => {
  let component: HotelDashboard;
  let fixture: ComponentFixture<HotelDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HotelDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HotelDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
