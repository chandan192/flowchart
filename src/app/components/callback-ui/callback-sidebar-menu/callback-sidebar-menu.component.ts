import { Component, OnInit, EventEmitter, Output, AfterViewInit, Input, OnDestroy, ViewChild } from '@angular/core';
import { ActionApi, ActionApiList } from './../../../interfaces/action-api';
import { TreeNode, MenuItem, SelectItem } from 'primeng/api';
import { CallbackDataServiceService } from './../../../services/callback-data-service.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Operator } from './../../../interfaces/action-api';
import { MetadataService } from './../../../services/metadata.service';
import { Metadata } from './../../../interfaces/metadata';
import { ExtractdataComponent } from '../extractdata/extractdata.component';

@Component({
  selector: 'app-callback-sidebar-menu',
  templateUrl: './callback-sidebar-menu.component.html',
  styleUrls: ['./callback-sidebar-menu.component.css']
})


export class CallbackSidebarMenuComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('extractdata') extractdata: ExtractdataComponent;
  @Output() loaded: EventEmitter<any> = new EventEmitter();
  @Input() selectedTabIndex: number;
  actionApiList: { [key: string]: ActionApi[] } = null;
  showApiDialog = false;
  currentActionApi: ActionApi = null;
  apiTreeData: TreeNode[] = [];
  fpToolbarTreeData: TreeNode[] = [];

  // Toolbar tree data for State diagram.
  sdToolbarTreeData: TreeNode[] = [];
  apiCount = 0;
  timer: any = null;
  items1: MenuItem[];
  items2: MenuItem[];
  channels: SelectItem[];
  showExtractDialog = false;
  showLocalVarDialog = false;
  form: FormGroup = null;
  localVar: any;
  dummyItems: MenuItem[] = [];
  dragItemCheckInterval = null;
  metadata: Metadata = null;
  usersegments: SelectItem[];
  events: SelectItem[];
  custommetrics: SelectItem[];
  updateDatapoint = '';


  constructor(private cbData: CallbackDataServiceService, private metaDataService: MetadataService) {

    console.log('fpToolbarTreeData', this.fpToolbarTreeData);
    // console.log('DataPoints  : ', this.cbData.getDataPoint());

    this.cbData.on('callbackChanged').subscribe(() => {
      this.getLocalVarDataPoints();
    });

    this.actionApiList = ActionApiList.apiList;

    this.cbData.on('addedLocalVar').subscribe(() => this.getLocalVarDataPoints());
    this.cbData.on('addedDataPoint').subscribe(() => this.getLocalVarDataPoints());

    this.form = new FormGroup({
      lhs: new FormControl('', Validators.required),
      rhs: new FormControl('', Validators.required),
      operator: new FormControl('', Validators.required),
    });





    this.items1 = [
      {
        label: '  Data points',
        icon: 'fa fa-mixcloud',
        styleClass: 'nvmenuitem',
        items: [{
          label: 'Add', icon: 'pi pi-plus', styleClass: 'drag  nvmenuitem', command: () => {
            this.openExtractDialog();
          }
        }]
      },
      {
        label: '  Local Variables',
        icon: 'fa fa-cubes',
        styleClass: 'nvmenuitem',
        items: [{
          label: 'Add', icon: 'pi pi-plus', styleClass: 'drag nvmenuitem', command: () => {
            this.addLocal();
          }
        }]
      },
      {
        label: 'Operators',
        icon: 'fa fa-calculator',
        styleClass: 'nvmenuitem',
        items: []
      },
      {
        label: 'Channels',
        styleClass: 'nvmenuitem',
        items: []
      },
      {
        label: 'Events',
        styleClass: 'nvmenuitem',
        items: []
      },
      {
        label: 'UserSegments',
        styleClass: 'nvmenuitem',
        items: []
      },
      {
        label: 'Custom Metrics',
        styleClass: 'nvmenuitem',
        items: []
      },


    ];


    let tmp = [];

    this.metaDataService.getMetadata().subscribe((response: any) => {
      this.metadata = response;

      // -------channel----------
      const channelm: any[] = Array.from(this.metadata.channelMap.keys());
      this.channels = channelm.map((key) => {
        return {
          label: this.metadata.channelMap.get(key).name,
          value: this.metadata.channelMap.get(key).name
        };
      });


      // --------user segment-------------
      const usersegment: any[] = Array.from(this.metadata.userSegmentMap.keys());
      this.usersegments = usersegment.map((key) => {
        return {
          label: this.metadata.userSegmentMap.get(key).name,
          value: this.metadata.userSegmentMap.get(key).id
        };
      });

      //  ------------- events -------------
      const eventm: any[] = Array.from(this.metadata.eventMap.keys());
      this.events = eventm.map((key) => {
        return {
          label: this.metadata.eventMap.get(key).name,
          value: this.metadata.eventMap.get(key).id
        };
      });

      //  ------------- custom metrics --------------
      const custommetricm: any[] = Array.from(this.metadata.customMetricMap.keys());
      this.custommetrics = custommetricm.map((key) => {
        return {
          label: this.metadata.customMetricMap.get(key).name,
          value: this.metadata.customMetricMap.get(key).id
        };
      });

      tmp = [];
      for (const i of this.channels) {
        tmp.push({
          label: i.label,
          id: 'channel$' + i.label,
          styleClass: 'nvcbdrag channel nvmenuitem',
          style: { cursor: 'move' }

        });
      }

      for (const i of this.items1) {
        if (i.label === 'Channels') {
          i.items = tmp;
        }
      }


      tmp = [];
      for (const i of this.events) {
        tmp.push({
          label: i.label,
          id: 'event$' + i.label,
          styleClass: 'nvcbdrag event nvmenuitem'
        });
      }

      for (const i of this.items1) {
        if (i.label === 'Events') {
          i.items = tmp;
        }
      }

      tmp = [];
      for (const i of this.usersegments) {
        tmp.push({
          label: i.label,
          id: 'usersegment$' + i.label,
          styleClass: 'nvcbdrag usersegment nvmenuitem'
        });
      }

      for (const i of this.items1) {
        if (i.label === 'UserSegments') {
          i.items = tmp;
        }
      }

      tmp = [];
      for (const i of this.custommetrics) {
        tmp.push({
          label: i.label,
          id: 'custommetric$' + i.label,
          styleClass: 'nvcbdrag custommetric nvmenuitem'
        });
      }

      for (const i of this.items1) {
        if (i.label === 'Custom Metrics') {
          i.items = tmp;
        }
      }

      setTimeout(() => {
        this.markItemsDraggable();

      }, 100);

    });

    tmp = [];
    for (const i of Operator.operatorList) {
      tmp.push({
        label: i.name,
        id: 'operator$' + i.name,
        styleClass: 'nvcbdrag operator nvmenuitem'
      });
    }
    this.items1[2].items = tmp;







    this.items2 = [{
      label: 'Condition',
      icon: 'pi pi-fw pi-file',
      styleClass: 'drag condition nvmenuitem'
    }];

    // tslint:disable-next-line: forin
    for (const apiGroup in this.actionApiList) {
      const item = {
        label: apiGroup,
        icon: 'pi pi-fw pi-file',
        styleClass: 'nvmenuitem',
        items: []
      };

      this.actionApiList[apiGroup].forEach(api => {
        item.items.push({
          label: api.label,
          id: api.id,
          styleClass: 'drag api nvmenuitem',
          title: 'Drag api ' + api.label
        });
      });

      this.items2.push(item);
    }


    // this.items = [
    //   {
    //     label: 'Condition',
    //     // data: { type: 'question' },
    //     icon: 'pi pi-fw pi-file',
    //     styleClass: 'drag condition'
    //   },
    //   {

    //     label: 'SPA',
    //     icon: 'pi pi-fw pi-file',
    //     items: [
    //       {
    //         label: 'Page Transition Start',
    //         id: 'cav_nv_ajax_pg_start',
    //         styleClass: 'drag api',
    //         title: 'Drag api'
    //       },
    //       {
    //         label: 'Page Transition End',
    //         id: 'cav_nv_ajax_pg_end',
    //         styleClass: 'drag api',
    //         title: 'Drag api'
    //       },
    //       {
    //         label: 'Transaction Start',
    //         id: 'cav_nv_ajax_start',
    //         styleClass: 'drag api',
    //         title: 'Drag api'
    //       },
    //       {
    //         label: 'Transaction Report',
    //         id: 'cav_nv_ajax_report',
    //         styleClass: 'drag api',
    //         title: 'Drag api'
    //       },
    //       {
    //         label: 'Transaction End',
    //         id: 'cav_nv_ajax_pg_end',
    //         styleClass: 'drag api',
    //         title: 'Drag api'
    //       },

    //     ]
    //   },
    //   {
    //     label: 'Cookie',
    //     icon: 'pi pi-fw pi-file',
    //     items: [
    //       {
    //         label: 'Set Cookie',
    //         id: 'setCookie',
    //         styleClass: 'drag api',
    //         title: 'Drag api'
    //       },
    //       {
    //         label: 'Remove Cookie',
    //         id: 'setCookie',
    //         styleClass: 'drag api',
    //         title: 'Drag api'
    //       },
    //     ]
    //   },
    //   {
    //     label: 'State',
    //     icon: 'pi pi-fw pi-file',
    //     items: [
    //       {
    //         label: 'Goto State',
    //         id: 'gotoState',
    //         styleClass: 'drag api',
    //         title: 'Drag api'
    //       }
    //     ]
    //   },
    //   {
    //     label: 'Session_Data',
    //     icon: 'pi pi-fw pi-file',
    //     items: [
    //       {
    //         label: 'Set Session Data',
    //         id: 'setSessionData',
    //         styleClass: 'drag api',
    //         title: 'Drag api'
    //       }
    //     ]
    //   },
    //   {
    //     label: 'Session_State',
    //     icon: 'pi pi-fw pi-file',
    //     items: [
    //       {
    //         label: 'Set Session State',
    //         id: 'setSessionState',
    //         styleClass: 'drag api',
    //         title: 'Drag api'
    //       }
    //     ]
    //   },
    //   {
    //     label: 'LoginId',
    //     icon: 'pi pi-fw pi-file',
    //     items: [
    //       {
    //         label: 'Set Login Id',
    //         id: 'setLoginId',
    //         styleClass: 'drag api',
    //         title: 'Drag api'
    //       }
    //     ]
    //   },
    //   {
    //     label: 'SessionId',
    //     icon: 'pi pi-fw pi-file',
    //     items: [
    //       {
    //         label: 'Set SessionId',
    //         id: 'setSessionId',
    //         styleClass: 'drag api',
    //         title: 'Drag api'
    //       }
    //     ]
    //   },
    //   {
    //     label: 'LogEvent',
    //     icon: 'pi pi-fw pi-file',
    //     items: [
    //       {
    //         label: 'Log Event',
    //         id: 'eventName',
    //         styleClass: 'drag api',
    //         title: 'Drag api'
    //       }
    //     ]
    //   },
    //   {
    //     label: 'UserSegment',
    //     icon: 'pi pi-fw pi-file',
    //     items: [
    //       {
    //         label: 'Set User Segment',
    //         id: 'userSegment',
    //         styleClass: 'drag api',
    //         title: 'Drag api'
    //       }
    //     ]
    //   },
    //   {
    //     label: 'CustomMetric',
    //     icon: 'pi pi-fw pi-file',
    //     items: [
    //       {
    //         label: 'Custom Matric Name',
    //         id: 'customMetric',
    //         styleClass: 'drag api',
    //         title: 'Drag api'
    //       }
    //     ]
    //   },
    //   {
    //     label: 'OrderTotal',
    //     icon: 'pi pi-fw pi-file',
    //     items: [
    //       {
    //         label: 'Order Total',
    //         id: 'orderTotal',
    //         styleClass: 'drag api',
    //         title: 'Drag api'
    //       }
    //     ]
    //   }
    // ];



    this.apiTreeData = this.apiToTreeData();

    this.fpToolbarTreeData = [{
      label: 'Condition',
      data: { type: 'question' },
      icon: 'fa fa-file'
    }, {
      label: 'Action Apis',
      data: { id: 'action_api', type: 'folder' },
      expandedIcon: 'fa fa-folder-open',
      collapsedIcon: 'fa fa-folder',
      expanded: true,
      children: this.apiTreeData
    }];

    console.log('fpToolbarTreeData', this.fpToolbarTreeData);

    this.sdToolbarTreeData = [
      {
        label: 'State',
        data: {
          type: 'state',
          w: 100,
          h: 70
        },
        icon: 'fa fa-file'
      }
      // {
      //   label: 'Trigger',
      //   data: {
      //     type: 'trigger',
      //     w: 120,
      //     h: 70
      //   },
      //   icon: 'fa fa-file'
      // }, {
      //   label: 'Action',
      //   data: {
      //     type: 'action',
      //     w: 120,
      //     h: 70
      //   },
      //   icon: 'fa fa-file'
      // }
    ];
  }

  ngOnInit() {
    // set a timeinterval to check if api list is rendered or not.
    this.timer = setInterval(() => {
      if (document.querySelectorAll('.action-api').length >= this.apiCount) {
        setTimeout(() => {
          this.loaded.emit(true);
          console.log('sidebar loaded at - ', performance.now());
        }, 100);
        clearInterval(this.timer);
      }
    }, 100);
    setTimeout(() => {
      this.markItemsDraggable();

    }, 500);

  }

  ngAfterViewInit() {
    this.markItemsDraggable();
  }

  markItemsDraggable() {
    const items = document.querySelectorAll('.nvcbdrag');

    items.forEach(item => {
      if (item.getAttribute('draggable') !== 'true') {
        item.setAttribute('draggable', 'true');
        // set the pointer type to drag
        (item.children[0] as HTMLElement).style.cursor = 'move';

        if (item.classList.contains('datapoint')) {
          const x = (item.children[0].children[0] as HTMLElement);
          x.style.cssFloat = 'right';
          x.style.cursor = 'pointer';
          x.setAttribute('title', 'Edit Datapoint');
          x.addEventListener('click', () => {
            this.updateDatapoint = item['innerText'];
            this.showExtractDialog = true;
          });
        }

        item.addEventListener('dragstart', (ev: DragEvent) => {
          const id = item.querySelector('a').getAttribute('id');

          console.log('condition-dd, dragging element - ' + id);
          ev.dataTransfer.setData('text', id);
        });
      }
    });
  }

  getLocalVarDataPoints(): void {


    const dataPoints = this.cbData.getDataPoint();
    const localVars = this.cbData.getLocalVar();

    console.log('dataPoints - ', dataPoints, ', localVars - ' + localVars);

    this.items1[0].items.length = 1;
    if (dataPoints) {
      for (let i = 0; i < dataPoints.length; i++) {
        this.items1[0].items[i + 1] = {
          label: dataPoints[i].name,
          icon: 'pi pi-pencil',
          id: 'datapoint$' + dataPoints[i].name,
          styleClass: 'nvcbdrag datapoint nvmenuitem',
        };
      }
    }

    this.items1[1].items.length = 1;
    if (localVars) {
      for (let i = 0; i < localVars.length; i++) {
        this.items1[1].items[i + 1] = {
          label: localVars[i].name,
          id: 'localvar$' + localVars[i].name,
          styleClass: 'nvcbdrag localvar  nvmenuitem'
        };
      }
    }
    setTimeout(() => {
      this.markItemsDraggable();

    }, 100);
  }

  openExtractDialog = () => {
    console.log('Extract Dialog opened', this.extractdata);
    this.updateDatapoint = '';
    this.showExtractDialog = true;
  }

  resetForm() {
    // this.extractdata.form.reset();
    this.extractdata.testForm.reset();
  }

  addLocal() {
    this.form.addControl('localVar', new FormControl(''));


    this.showLocalVarDialog = true;
  }

  addLocalVar() {
    // let TempLocalVar = { label: this.localVar, value: this.localVar };
    this.cbData.addLocalVar({ name: this.localVar });
    this.showLocalVarDialog = false;
  }

  ectractedDataPoint(event) {
    console.log('event on submit extractedData', event);
    this.showExtractDialog = false;
  }


  onDrag($event) {
    console.log('onDrag fired for event - ', $event);
    this.showApiDialog = true;
    this.currentActionApi = $event;
  }

  /*These methods are related to jtk drop functioanlity */
  typeExtractor(el: Element) {
    if (el.getAttribute('jtk-node-type')) {
      return el.getAttribute('jtk-node-type');
    }

    // Because of tiered menu we are not able to set attributes.
    // Get from class.
    if (el.classList.contains('condition')) {
      return 'question';
    } else if (el.classList.contains('api')) {
      return 'action';
    } else if (el.classList.contains('datapoint')) {
      return 'datapoint';
    } else if (el.classList.contains('localvar')) {
      return 'localvar';
    } else if (el.classList.contains('operator')) {
      return 'operator';
    } else if (el.classList.contains('channel')) {
      return 'channel';
    } else {
      return 'unknown';
    }
  }
  //igonre
  dataGenerator(_type: string, el: Element) {
    // class based draggable element.
    console.log('dataGenerator on element - ', el);
    if (el.classList.contains('condition')) {
      return {
        type: 'question',
        w: 180,
        h: 70
      };
    } else if (el.classList.contains('api')) {
      return {
        type: 'action',
        w: 180,
        h: 70,
        api: el.querySelector('a').getAttribute('id')
        // api: el.querySelector('a').getAttribute('title').replace('Drag api ', '')
      };
    }


    // TODO: Check if this code is not used then remove.
    const data = {
      type: el.getAttribute('jtk-node-type'),
      w: parseInt(el.getAttribute('jtk-width'), 10),
      h: parseInt(el.getAttribute('jtk-height'), 10),
    };

    // check if this is action-api then return api data too.
    console.log('dataGenerator on element - ', el);
    if (el.getAttribute('api') !== null) {
      data['api'] = el.getAttribute('api');
    }

    return data;
  }


  apiToTreeData(): TreeNode[] {
    const apis = [];
    // tslint:disable-next-line: forin
    for (const key in this.actionApiList) {
      const node: TreeNode = {};
      node.label = key;
      node.data = { type: 'folder', id: key };
      node.expandedIcon = 'fa fa-folder-open';
      node.collapsedIcon = 'fa fa-folder';
      // Note: we are keeping node expanded otherwise it will not be rendered on onload and that is why,
      // jsplumb will not be able to mark that draggable.
      node.expanded = true;
      node.children = [];

      this.actionApiList[key].forEach(api => {
        const n: TreeNode = {};
        n.label = api.label;
        n.data = api;
        n.icon = 'fa fa-file';
        node.children.push(n);
        this.apiCount++;
      });

      apis.push(node);
    }

    console.log('tree data for apis - ', apis);
    return apis;
  }


  ngOnDestroy() {
    // clear all timeres which are running.
    if (this.dragItemCheckInterval) {
      clearInterval(this.dragItemCheckInterval);
    }
  }
}
