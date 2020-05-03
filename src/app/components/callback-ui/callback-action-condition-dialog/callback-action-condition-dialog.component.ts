import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Operator } from './../../../interfaces/action-api';
import { CallbackDataServiceService } from './../../../services/callback-data-service.service';

@Component({
  selector: 'app-callback-action-condition-dialog',
  templateUrl: './callback-action-condition-dialog.component.html',
  styleUrls: ['./callback-action-condition-dialog.component.css']
})

export class CallbackActionConditionDialogComponent implements OnInit, OnChanges {

  constructor(private dpData: CallbackDataServiceService) {
    this.operatorList = Operator.operatorList;
  }

  @Output() conditionAdded: EventEmitter<any> = new EventEmitter();
  @Input() args: any;
  @Output() showCondition: EventEmitter<boolean> = new EventEmitter();
  form: FormGroup;

  // TODO: operator list has to be generated dynamically on the basis of operand type.
  operatorList: any[] = [];
  extractedData: any = null;
  LocalVar: any = null;
  groupedVariableList: any = null;
  localVar: any;

  showExtractDialog: any = false;

  showLocalVarDialog = false;


  addLocal() {
    this.form.addControl('localVar', new FormControl(''));
    this.showLocalVarDialog = true;
  }

  ngOnInit() {
    this.getGroupedVarData();

    this.dpData.on('callbackChanged').subscribe(data => {
      this.getGroupedVarData();
    });

    this.setForm();
    // register for change.
    this.dpData.on('addedLocalVar').subscribe(data => this.getGroupedVarData());
    this.dpData.on('addedDataPoint').subscribe(data => this.getGroupedVarData());
  }

  ngOnChanges() {
    console.log('ngOnChanges - called', this.extractedData, '\n', this.LocalVar);
    this.setForm();
  }

  setForm() {
    const args = this.args || {};
    // initialise form group.
    this.form = new FormGroup({
      lhs: new FormControl(args.lhs || '', Validators.required),
      rhs: new FormControl(args.rhs || '', Validators.required),
      operator: new FormControl(args.operator || '', Validators.required),
    });
  }

  onSubmit() {

    const lhs = this.form.get('lhs');

    if (lhs.value.search('@DP.') > -1) {
      lhs.patchValue(lhs.value.replace('@DP.', ''));

    } else if (lhs.value.search('@Local.') > -1) {
      lhs.patchValue(lhs.value.replace('@Local.', ''));
    }

    console.log('form submitted with value - ', this.form.value);

    this.conditionAdded.emit(this.form.value);
    this.clearForm();
  }

  hideForm() {
    this.showCondition.emit(false);

  }

  clearForm() {
    this.form.reset();
  }

  getGroupedVarData() {
    console.log('getGroupedVarData called');
    // TODO: it has to pass by parent component or some other service.
    this.groupedVariableList = [{
      label: 'Data points',
      value: 'fa fa-mixcloud',
      items: []
    }, {
      label: 'Local variables',
      value: 'fa fa-cubes',
      items: []

    }];

    const dataPoints = this.dpData.getDataPoint();
    const localVars = this.dpData.getLocalVar();

    console.log('dataPoints - ', dataPoints, ', localVars - ' + localVars);
    if (dataPoints) {
      // this.groupedVariableList[0].items = [];
      for (let i = 0; i < dataPoints.length; i++) {
        const temp = { label: dataPoints[i].name, value: dataPoints[i].name };
        this.groupedVariableList[0].items[i] = temp;
      }
    }
    if (localVars) {
      for (let i = 0; i < localVars.length; i++) {
        // this.groupedVariableList[1].items = [];
        console.log('items of localVar', localVars[i]);
        this.groupedVariableList[1].items[i] = { label: localVars[i].name, value: localVars[i].name };
      }
    }
  }
  openExtractDialog() {
    this.showExtractDialog = true;
  }

  ectractedDataPoint(event) {
    console.log('event on submit extractedData', event);
    this.showExtractDialog = false;
  }
  addLocalVar() {
    // let TempLocalVar = { label: this.localVar, value: this.localVar };
    this.dpData.addLocalVar({ name: this.localVar });
    this.showLocalVarDialog = false;
  }

  allowDrop(ev) {
    console.log('condition-dd: allowDrop called');
    ev.preventDefault();
  }

  drop(ev, target) {
    const value = ev.dataTransfer.getData('text').split('$')[1];
    const valueFor = ev.dataTransfer.getData('text').split('$')[0];
    console.log('condition-dd: drop with value - ' + value);
    // set the value.
    switch (target) {
      case 'lhs':
        if (valueFor === 'datapoint') {
          this.form.controls.lhs.patchValue(value);

        } else if (valueFor === 'localvar') {
          this.form.controls.lhs.patchValue(value);
        }
        break;

      case 'operator':

        if (valueFor === 'operator') {
          for (const i of this.operatorList) {
            if (value === i.name) {
              this.form.controls.operator.patchValue(i);

            }
          }
        }
        break;

      case 'rhs':
        if (valueFor === 'datapoint') {
          // this.form.controls.rhs.patchValue('@DP.' + value);
          this.form.controls.rhs.patchValue(value);

        } else if (valueFor === 'localvar') {
          this.form.controls.rhs.patchValue(value);
        }
        break;
    }
  }

  onChange(e) {
    console.log('e : ', e);
  }
}
