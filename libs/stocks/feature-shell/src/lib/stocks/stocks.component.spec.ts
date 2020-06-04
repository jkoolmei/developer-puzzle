import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StocksComponent } from './stocks.component';
import { ReactiveFormsModule } from '@angular/forms';
import { PriceQueryFacade } from '@coding-challenge/stocks/data-access-price-query';
import { CommonModule } from '@angular/common';
import { MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule } from '@angular/material';
import { StoreModule } from '@ngrx/store';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('StocksComponent', () => {
  let component: StocksComponent;
  let fixture: ComponentFixture<StocksComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StocksComponent ],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        NoopAnimationsModule,
        StoreModule.forRoot({})],
      providers: [PriceQueryFacade]
    }).compileComponents();

    fixture = TestBed.createComponent(StocksComponent);
    component = fixture.componentInstance;
  }));

  it('should create',() => {
    expect(component).toBeTruthy();
  });

  it('should test form validity', () => {
    const form = component.stockPickerForm;
    const symbolInput = form.controls['symbol'];
    const periodInput = form.controls['period'];
    symbolInput.setValue('AAPL');
    periodInput.setValue('6m');
    expect(form.valid).toBeTruthy();
  });

  it('should test symbol input error', () => {
    const form = component.stockPickerForm;
    const symbolInput = form.controls['symbol'];
    expect(symbolInput.errors.required).toBeTruthy();

    symbolInput.setValue('ABC');
    expect(symbolInput.errors).toBeNull();
  });

  it('should test period input error', () => {
    const form = component.stockPickerForm;
    const symbolInput = form.controls['period'];
    expect(symbolInput.errors.required).toBeTruthy();

    symbolInput.setValue('6m');
    expect(symbolInput.errors).toBeNull();
  });

  it('should get data',() => {
    const quotes$ = of([["2018-06-04", 195.81], ["2017-04-04", 190.81]]);
    component.quotes$ = quotes$;

    quotes$.subscribe(quote => {
      expect(quote[0][1]).toBe(195.81);
      expect(quote[1][0]).toBe("2017-04-04");
    })
  });

});
