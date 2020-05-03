import { Component, OnInit, Output, EventEmitter, Input, OnChanges, ViewChild, SimpleChanges } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CallbackDataServiceService } from './../../../services/callback-data-service.service';
import { DataPoint } from './../../../interfaces/callback';


@Component({
  selector: 'app-extractdata',
  templateUrl: './extractdata.component.html',
  styleUrls: ['./extractdata.component.css']
})
export class ExtractdataComponent implements OnInit, OnChanges {
  @Output() extractedData: EventEmitter<any> = new EventEmitter();
  @Input() updateDatapoint = '';
  form: FormGroup = null;
  dataType: any;
  dataSource: any;
  indexOption: any;
  eleProperty: any;
  urlProperties: any;
  eleStyle: any;

  extractedDataList: any = [];
  pattMatched: boolean;
  testStr = '';
  isTesting = false;
  matchedCount = 0;
  testForm: FormGroup;

  constructor(private callbackdataservice: CallbackDataServiceService) {
    this.form = new FormGroup({
      name: new FormControl('', Validators.required),
      type: new FormControl('', Validators.required),
      source: new FormControl('', Validators.required),
      pattern: new FormControl(''),
      patternIndex: new FormControl(''),
      index: new FormControl(''),
      cssSelector: new FormControl(''),
      property: new FormControl(''),
      attributeName: new FormControl(''),
      elementStyle: new FormControl(''),
      urlProperty: new FormControl(''),
      cookieName: new FormControl(''),
    });

    this.testForm = new FormGroup({
      testStr: new FormControl('')
    });

    this.dataType = [
      { label: 'Scaler', value: 'scaler' },
      { label: 'Vector', value: 'vector' }
    ];

    this.dataSource = [
      { label: 'Select Source', value: null },
      { label: 'Element', value: 'ele' },
      { label: 'Url', value: 'url' },
      { label: 'Cookie', value: 'cookie' },
      { label: 'Code snippet', value: 'code' }
    ];

    this.eleProperty = [
      { label: 'Select Property', value: null },
      { label: 'Self', value: 'self' },
      { label: 'Text', value: 'text' },
      { label: 'Class', value: 'clsss' },
      { label: 'Attribute', value: 'attribute' },
      { label: 'Style', value: 'style' }
    ];

    this.eleStyle = [
      { label: 'Select Style', value: null },
      { label: 'Display', value: 'display' },
      { label: 'Height', value: 'height' },
      { label: 'Width', value: 'width' },
      { label: 'Position', value: 'position' },
      { label: 'Custom', value: 'custom' }
    ];

    this.urlProperties = [
      { label: 'Select Url Properties', value: null },
      { label: 'Host', value: 'host' },
      { label: 'Hostname', value: 'hostname' },
      { label: 'Origin', value: 'origin' },
      { label: 'Path', value: 'path' },
      { label: 'Href', value: 'href' },
      { label: 'Search', value: 'search' },
      { label: 'Protocol', value: 'protocol' }
    ];

    this.indexOption = [
      { label: 'First', value: 'First' },
      { label: 'Last', value: 'Last' },
      { label: 'Index Position', value: 'Index' }
    ];
  }

  ngOnInit() {
    this.editDataPoint();

    // this.callbackdataservice.currentCbData.subscribe((extractedData) => {
    //   if (extractedData && extractedData.length) {
    //     this.extractedDataList = extractedData;
    //   } else {
    //     this.extractedDataList = [];
    //   }
    // });
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.editDataPoint();
  }


  editDataPoint() {
    console.log('updateDatapoint : ', this.updateDatapoint);

    if (this.updateDatapoint !== '') {
      const datapoint: DataPoint[] = this.callbackdataservice.getDataPoint();
      for (const i of datapoint) {
        if (this.updateDatapoint === i.name) {
          this.form.patchValue(i);
          this.form.get('name').disable();
        } else {
          this.form.get('name').enable();
        }
      }
    } else {
      this.form.get('name').enable();
      this.form.reset();
    }
  }

  testPattern() {

    this.isTesting = true;

    const reg = new RegExp(this.form.get('pattern').value, 'g');
    const str = this.testForm.get('testStr').value;
    this.matchedCount = ((str || '').match(reg) || []).length;

  }


  onSubmit(type) {
    this.isTesting = false;

    console.log('form submitted with value -  in', this.form.value);
    this.callbackdataservice.addDataPoint(this.form.value, type);

    this.extractedData.emit(false);

    this.form.reset();

    // this.newExtractedData();
  }

  // newExtractedData(){
  //   this.extractedDataList.push(this.form.value);
  //   this.callbackdataservice.ChangeDataPoint(this.extractedDataList);
  // }

}
