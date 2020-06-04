import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PriceQueryFacade } from '@coding-challenge/stocks/data-access-price-query';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'coding-challenge-stocks',
  templateUrl: './stocks.component.html',
  styleUrls: ['./stocks.component.css']
})
export class StocksComponent implements OnInit, OnDestroy {
  stockPickerForm: FormGroup;

  quotes$ = this.priceQuery.priceQueries$;
  error$ = this.priceQuery.error$;
  destroy$ = new Subject<void>();
  maxDateFrom = new Date();
  maxDateTo = new Date();

  timePeriods = [
    { viewValue: 'All available data', value: 'max' },
    { viewValue: 'Five years', value: '5y' },
    { viewValue: 'Two years', value: '2y' },
    { viewValue: 'One year', value: '1y' },
    { viewValue: 'Year-to-date', value: 'ytd' },
    { viewValue: 'Six months', value: '6m' },
    { viewValue: 'Three months', value: '3m' },
    { viewValue: 'One month', value: '1m' }
  ];

  constructor(private fb: FormBuilder, private priceQuery: PriceQueryFacade) {
    this.stockPickerForm = fb.group({
      symbol: [null, Validators.required],
      period: [null, Validators.required],
      dateFrom: [null, Validators.required],
      dateTo: [null, Validators.required]
    });
  }

  ngOnInit() {
    this.stockPickerForm.valueChanges.pipe(
      takeUntil(this.destroy$))
      .subscribe(() => {
        this.fetchQuote();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  fetchQuote() {
    this.setValidators();
    if (this.stockPickerForm.valid) {
      const { symbol, period, dateFrom, dateTo } = this.stockPickerForm.value;
      this.priceQuery.fetchQuote(symbol, this.getOptimalPeriod(), dateFrom, dateTo);
    }
  }

  private validateAndChangeDates(isDateFromVal: boolean) {
    const dateFromValue = this.stockPickerForm.controls['dateFrom'].value;
    const dateToValue = this.stockPickerForm.controls['dateTo'].value;
    if (dateToValue && (dateFromValue > dateToValue)) {
      if(isDateFromVal) {
        this.stockPickerForm.controls['dateTo'].setValue(dateFromValue);
      } else {
        this.stockPickerForm.controls['dateFrom'].setValue(dateToValue);
      }
    }
  }

  private getOptimalPeriod(): string {
    const dateFromValue = this.stockPickerForm.controls['dateFrom'].value;
    const periodValue = this.stockPickerForm.controls['period'].value;
    if (periodValue == null && dateFromValue != null) {
      const months = this.getMonthsDiff(new Date(dateFromValue), new Date());
      if (months > 60) {
        return 'max'
      }
      if (months > 24) {
        return '5y';
      }
      if (months > 12) {
        return '2y';
      }
      if (months > 6) {
        return '1y';
      }
      if (months > 3) {
        return '6m';
      }
      if (months > 1) {
        return '3m'
      }
      if (months <= 1) {
        return '1m';
      }
    }
    return periodValue;
  }

  private getMonthsDiff(d1, d2) {
    const years = d2.getFullYear() - d1.getFullYear();
    return (years * 12) + (d2.getMonth() - d1.getMonth() + 1);
  }

  private setValidators() {
    const period = this.stockPickerForm.controls['period'];
    const dateFrom = this.stockPickerForm.controls['dateFrom'];
    const dateTo = this.stockPickerForm.controls['dateTo'];

    if (period.value != null) {
      dateFrom.setValidators(Validators.nullValidator);
      dateTo.setValidators(Validators.nullValidator);
      dateFrom.updateValueAndValidity({emitEvent : false});
      dateTo.updateValueAndValidity({emitEvent : false});
    }
    if (dateFrom.value != null && dateTo.value != null) {
      period.setValidators(Validators.nullValidator);
      period.updateValueAndValidity({emitEvent : false});
    }
  }
}
