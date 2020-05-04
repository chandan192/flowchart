import { Component, Input, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SelectItem, MenuItem } from 'primeng/api';
import { Metadata } from 'src/app/interfaces/metadata';
import { Action, Callback, CallBackData, State } from './../../../interfaces/callback';
import { CallbackDataServiceService } from './../../../services/callback-data-service.service';
import { MetadataService } from './../../../services/metadata.service';
import { NvhttpService } from './../../../services/nvhttp.service';

import { ConfirmationService } from 'primeng/api';
// import { NVBreadCrumbService } from './../../../services/nvbreadcrumb.service';
// import { BreadCrumbInfo } from './../../../interfaces/breadcrumbinfo';

interface AgentProfileData {
  callbacks: ICallbacks[];
}

interface ICallbacks {
  pi: string;
  runAt: string;
  callbackId: string;
  data: Callback;
}

@Component({
  selector: 'app-callback-designer',
  templateUrl: './callback-designer.component.html',
  styleUrls: ['./callback-designer.component.css'],
  providers: [ConfirmationService]
})

export class CallbackDesignerComponent implements OnInit {

  static STATE_DIAGRAM_TAB = 0;
  static FLOW_CHART_TAB = 1;
  static SOURCE_CODE_TAB = 2;
  static TriggerActionSideBar = 3;
  static TRUE = true;
  static FALSE = false;

  activeTabIndex: number = CallbackDesignerComponent.STATE_DIAGRAM_TAB;
  openFlag = false;
  opened: boolean;
  currentAction: Action = null;
  currentState: State = null;
  sidebarLoaded = false;
  AddCallbackDialog = false;
  onTriggerEvents: SelectItem[];
  onTrigger: any = null;
  name = '';
  description = '';
  pageid: any[] = [];
  channel: any = null;
  channels: SelectItem[] = [];
  pages: any[] = [];
  // metadata: Metadata = null;
  // breadInfo: BreadCrumbInfo;
  profile: any = null;
  profiles: SelectItem[] = [];
  profileResponse = [];
  @Input() callback: Callback;
  callbackList: CallBackData[];
  callbackEntry: CallBackData;
  newTriggerName: string = null;
  visibleSidebar: boolean = false;
  AddTriggerDialog = false;
  select: boolean;
  currentActionName: string = null;
  metadata: Metadata;
  callbackItems: MenuItem[] = [];
  showLoader: boolean;
  // breadInfo: BreadCrumbInfo;

  constructor(private httpService: NvhttpService, private cbService: CallbackDataServiceService, private snackBar: MatSnackBar, private metaDataService: MetadataService, private confirmationService: ConfirmationService) {

    this.onTriggerEvents = [
      { label: 'Page Ready', value: 1 },
      { label: 'After Beacon', value: 2 },
      { label: 'Page Unload', value: 3 }
    ];

    // TODO : Call metadata service and fill the page and channel option

    this.metaDataService.getMetadata().subscribe(response => {
      this.metadata = response;
      console.log('metadata response---', response);
      // -------channel----------
      const channelm: any[] = Array.from(this.metadata.channelMap.keys());
      this.channels = channelm.map(key => {
        return {
          label: this.metadata.channelMap.get(key).name,
          value: this.metadata.channelMap.get(key).id
        };
      });

      // -------pages------------
      const pagem: any[] = Array.from(this.metadata.pageNameMap.keys());
      this.pages = pagem.map(key => {
        return {
          label: this.metadata.pageNameMap.get(key).name,
          value: this.metadata.pageNameMap.get(key).id
        };
      });
    });
  }

  ngOnInit() {
    this.showLoader = true;

    // if (NVBreadCrumbService.currentBreadInfo && NVBreadCrumbService.currentBreadInfo.label == 'Callback') {
    //   this.breadInfo = NVBreadCrumbService.currentBreadInfo;
    // } else {
    //   this.breadInfo = new BreadCrumbInfo('Callback', window.location.href, {});
    //   this.breadCrumbService.addbreadCrumb(this.breadInfo, null);
    // }

    this.httpService.getMetaData().subscribe(res => {
      console.log('res : ', res);
    });
    this.getCallback(null);

    // register editAction.
    this.cbService.on('editAction').subscribe(data => this.editAction(data));

    this.cbService.on('editState').subscribe(data => this.editState(data));

    this.cbService.on('openActionFlowChart').subscribe((data: any) => {
      console.log('openActionFlowChart called ', data);
      const actionId = data.edge.data.actionId;

      console.log('openActionFlowChart called for action - ', actionId);

      this.currentActionName = actionId;

      this.callback.actions.some(action => {
        if (action.id === actionId) {
          this.currentAction = action;
          return true;
        }
      });
    });

    // get profile details
    this.httpService.getAgentDBData().subscribe((response: any) => {
      console.log('response', response);
      this.profileResponse = response;
    }, () => {
      alert('Oops Something went wrong.');
    });

  }

  // ngOnChanges(){
  //   this.activeTabIndex = CallbackDesignerComponent.TriggerActionSideBar;
  // }

  editAction(obj) {
    const actionId = obj.id;
    console.log('editAction called for action id', actionId);

    if (this.callback === null) {
      alert('No Callback selected');
      return;
    }

    const match = this.callback.actions.some((action) => {
      if (action.id === actionId) {
        console.log('Edit action, matched action - ', action);
        this.currentAction = action;
        this.activeTabIndex = CallbackDesignerComponent.FLOW_CHART_TAB;
        // switch the tab.
        return true;
      }
      return false;
    });

    if (match === false) {
      alert('No Action matched for id - ' + actionId);
      return;
    }
  }

  openFlagChanged($event) {
    this.select = $event;
  }

  editState(obj) {
    const stateId = obj.id;

    console.log('editState called for state id and flag', this.openFlag, stateId, this.activeTabIndex);

    if (this.callback === null) {
      alert('No Callback selected');
      return;
    }

    const match = this.callback.states.some((state) => {
      if (state.id === stateId) {
        console.log('Edit state, matched state - ', state, this.openFlag);
        this.currentState = state;
        this.openFlag = CallbackDesignerComponent.TRUE;
        console.log('Edit state, matched state -2 ', state, this.openFlag);
        // insted of tab we need to show right pannel
        this.activeTabIndex = CallbackDesignerComponent.TriggerActionSideBar;
        return true;
      }
      return false;
    });

    if (match === false) {
      alert('No State matched for id - ' + stateId);
      return;
    }

  }

  addCallback() {
    this.visibleSidebar = false;
    this.AddCallbackDialog = true;
    this.callback = new Callback();
    this.cbService.setCallback(this.callback);

  }

  onChange(e) {
    console.log('e', e);
    this.profiles = [];
    this.profile = null;
    for (const i of this.profileResponse) {
      // tslint:disable-next-line: triple-equals
      if (i.channelId == e) {
        this.profiles.push({ label: i.name, value: i.name });
      }
    }
  }

  // Event will be triggered by sd when a new action is added.
  actionAdded($event) {
    console.log('Event actionAdded called', $event);
    if (this.callback && this.callback.actions.length > 0) {
      this.currentAction = this.callback.actions[0];
    }
  }

  stateAdded($event) {
    console.log('event on state emit', $event);
    if (this.callback && this.callback.states.length > 0) {
      this.currentState = this.callback.states[0];
    }
  }

  getCallback(name) {
    console.log('getCallback Function called : ', 'name - ', name);
    this.httpService.getCallbacks().subscribe((response: any) => {
      console.log('getCallback response : ', response);
      this.showLoader = false;
      this.callbackList = response;
      this.callbackItems = [];

      for (const i of this.callbackList) {
        this.callbackItems.push({
          label: i.name,
          icon: 'pi pi-trash',
          styleClass: 'sdcallback',
          id: 'sdcallback_' + i['callbackid'],
          command: (event: any) => {
            this.selectedCallback(i);
          }
        })
      }

      setTimeout(() => {
        this.setDeleteIcon();
      }, 100);

      if (this.callbackList.length === 0) {
        return;
      }

      // select current callback.

      if (name === null) {
        this.callbackEntry = this.callbackList[0];
        this.callbackItems[0].expanded = true;
        this.callback = JSON.parse(this.callbackEntry.jsondata.toString());
        this.deserializeActionMap(this.callback);
        // this.cbService.setCallback(this.callback);
        // return true;
      } else {

        // highlight the selected callback
        for (const cb of this.callbackList) {
          this.callbackItems.forEach(item => {
            if (item.label === name) {
              item.expanded = true;
            }
          });

          if (cb.name === name) {
            this.callbackEntry = cb;
            console.log('callbackEntry----------', this.callbackEntry);
            this.callback = JSON.parse(cb.jsondata.toString());
            this.deserializeActionMap(this.callback);
          }
        }

      }

      this.cbService.setCallback(this.callback);
      console.log('Current Callback : ', this.cbService.currentCallback);

    });
    // this.callbackService.broadcast('change', this.callbackService.callbackObj);
  }

  setDeleteIcon() {
    const items = document.querySelectorAll('.sdcallback');
    items.forEach(element => {
      const x = element.children[0].children[0] as HTMLElement;
      x.style.cssFloat = 'right';
      x.setAttribute('title', 'delete callback')
      x.addEventListener('click', () => {
        const callbackid = element.children[0].id.split('_')[1];
        console.log('callbackid : ', callbackid);
        this.deleteCallback(callbackid);
      });
    });
  }

  addCallbackData() {

    // validate fields
    if (this.name === '') {
      this.snackBar.open('Please enter name.', 'OK', {
        duration: 3000,
      });
      return;

    } else if (this.description === '') {
      this.snackBar.open('Please enter description.', 'OK', {
        duration: 3000,
      });
      return;

    } else if (this.onTrigger === null) {
      this.snackBar.open('Please select onTrigger.', 'OK', {
        duration: 3000,
      });
      return;

    } else if (this.pageid.length === 0) {
      this.snackBar.open('Please select pages.', 'OK', {
        duration: 3000,
      });
      return;

    } else if (this.channel === null) {
      this.snackBar.open('Please select channel.', 'OK', {
        duration: 3000,
      });
      return;

    } else if (this.profile === null) {
      this.snackBar.open('Please select profile.', 'OK', {
        duration: 3000,
      });
      return;

    }

    // hide the add Callback dialog
    this.AddCallbackDialog = false;

    // Handling for all pages
    // if all pages selected then pass -1

    if (this.pages.length === this.pageid.length) {
      this.pageid = ['-1'];
    }

    const callBackData = this.newMethod();
    this.showLoader = true
    this.httpService.addCallbacks(callBackData).subscribe((response: any) => {
      this.showLoader = false;
      console.log('CBDATA', callBackData, 'response : ', response);
      if (response) {
        this.getCallback(callBackData.name);
      }
    }, err => {
      this.showLoader = false;
      alert('Failed to add callback');
    });


    // this.CallbackDataServiceService.callbackObj = callBackData;
    // this.CallbackDataServiceService.callbacks.push(callBackData);
    // this.CallbackDataServiceService.broadcast('change',this.CallbackDataServiceService.callbackObj);
    // this.selectedCallback(callBackData);


    this.name = '';
    this.pageid = [];
    this.description = '';
    this.channel = null;
    this.profile = null;
    this.profiles = [];
    this.onTrigger = null;
  }

  private newMethod() {
    return new CallBackData(this.name, this.onTrigger, this.description, '', this.pageid.join(','), this.channel, this.profile, this.callback);
  }

  deserializeActionMap(callback) {
    const obj = callback.actionMap;

    if (Object.keys(obj).length) {
      const map: Map<string, Map<string, string>> = new Map();
      // tslint:disable-next-line: forin
      for (const key in obj) {
        const valueMap: Map<string, string> = new Map();
        // tslint:disable-next-line: forin
        for (const k in obj[key]) {
          valueMap.set(k, obj[key][k]);
        }
        map.set(key, valueMap);
      }

      console.log('actionMap after deserialise ', map);
      callback.actionMap = map;
    }
  }

  selectedCallback(callbackEntry) {
    this.currentActionName = null;
    this.currentAction = null;
    this.visibleSidebar = false;
    console.log('select Called', callbackEntry);

    // Check if current callback is dirty then first ask to save.
    if (this.callbackEntry && this.callbackEntry.name !== callbackEntry.name && this.callback.dirty) {
      alert('First save current callback - \'' + this.callbackEntry.name + '\'');
      return;
    }

    this.callbackEntry = callbackEntry;

    if (typeof callbackEntry.jsondata === 'string') {
      this.callback = JSON.parse(callbackEntry.jsondata);
    } else {
      this.callback = callbackEntry.jsondata;
    }

    this.cbService.setCallback(this.callback);

    this.deserializeActionMap(this.callback);

    // this.cbService.ChangeLocalVariable(this.callback.localVariables);

    // this.CallbackDataServiceService.callbackObj = callback;
    // this.CallbackDataServiceService.broadcast('change',this.CallbackDataServiceService.callbackObj);
    // this.CallbackDataServiceService.broadcast('selected',this.CallbackDataServiceService.callbackObj);
  }

  // TODO: acknowledge by message that successfully saved.
  saveCallback() {
    this.visibleSidebar = false;

    if (this.callbackEntry) {
      this.callbackEntry.jsondata = this.cbService.currentCallback;
      console.log('callback : ', this.callbackEntry);

      // Check if current action having some dirty nodes, then prompt error.
      if (this.currentAction != null) {
        // Check if current action having some dirty nodes, then prompt error.
        let dirtyNodesPresent = this.currentAction.data.aNOdes.some(node => node.dirty);

        dirtyNodesPresent = dirtyNodesPresent || this.currentAction.data.cNodes.some(node => node.dirty);

        if (dirtyNodesPresent) {
          alert('Can not save, First correct error in current action');
          return;
        }

        // Check if any placeholder left then show warning.
        if (this.currentAction.placeHolderNodes > 0) {
          const yes = confirm('Placeholder nodes will be removed. Do you want to continue ?');
          if (!yes) {
            return;
          }
        }
      }

      this.showLoader = true;

      this.httpService.updateCallback(this.callbackEntry).subscribe(res => {
        console.log('update callback ', res);


        this.showLoader = false

        this.callback.dirty = false;

        if (this.currentAction !== null) {
          this.currentAction.dirty = false;
        }
      }, err => {
        this.showLoader = false;
        alert('Failed to save callback');
      });
    }
  }

  deleteCallback(callbackid) {
    console.log('deleteCallback Function called : ', callbackid);

    this.confirmationService.confirm({
      message: 'Do you want to delete this callback?',
      header: 'Delete Confirmation',
      icon: 'pi pi-info-circle',

      accept: () => {
        this.showLoader = true;

        this.httpService.deleteCallback(callbackid).subscribe(res => {
          this.showLoader = false;
          console.log('deleteCallback Function , response : ', res);

          if (res === true) {
            alert('Callback deleted successfully.');
            this.getCallback(null);
          }
        },
          err => {
            this.showLoader = false;
            alert('Unable to delete callback.');
          });
      },
      reject: () => {

      }
    });


  }

  applyCallback() {
    this.visibleSidebar = false;

    if (this.callbackEntry) {
      this.callbackEntry.jsondata = this.cbService.currentCallback;
      console.log('-------', this.callbackEntry);
      console.log('ApplyCallback Function called | ', 'jsondata : ', this.callbackEntry.jsondata, ' name : ', this.callbackEntry.profilename);


      /*
      format of profiledata
      ----------------------------------
      {
        "callbacks": [
          {
            "pi": "1,2",
            "runAt": "PAGE_READY",
            "callbackId": "16",
            "data": "{}"
          }
        ]
      }
      */

      const profiledata = {} as AgentProfileData;
      const callback = {} as ICallbacks;
      callback.pi = this.callbackEntry['pageid'];
      callback.callbackId = this.callbackEntry['callbackid'];
      callback.data = this.callbackEntry.jsondata;
      for (const i of this.onTriggerEvents) {
        if (i.value == this.callbackEntry['type']) {
          callback.runAt = i.label.toLowerCase().split(' ').join('_');
        }
      }

      profiledata.callbacks = [];
      profiledata.callbacks.push(callback);

      console.log('profiledata : ', profiledata, ' profilename : ', this.callbackEntry.profilename);

      this.showLoader = true;
      this.httpService.UpdateAgentProfile(profiledata, this.callbackEntry.profilename).subscribe(res => {
        console.log('applyCallback response -  ', res);
        this.showLoader = false;
      }, err => {
        this.showLoader = false;
        alert('Failed to apply the changes.');
      });
    }
  }

  closeSideBar() {
    this.activeTabIndex = CallbackDesignerComponent.STATE_DIAGRAM_TAB;
    this.visibleSidebar = false;
  }

  addTrigger() {
    console.log('callback data --- ', this.callback);
    this.AddTriggerDialog = true;
  }

  currentActionGet($event) {

    // Check if current action is dirty then show error warning to save.
    if (this.currentAction && this.currentAction.id !== $event.id && this.currentAction.dirty) {
      alert('Please Save current action - \'' + this.currentAction.name + '\', ');
      return;
    }


    this.currentAction = $event;
    this.currentActionName = this.currentAction.name;
    this.select = true;
    console.log('current Action', this.currentAction.name);
  }

  refreshCallback() {
    this.getCallback(null);
  }

  resetForm() {
    this.name = '';
    this.description = '';
    this.onTrigger = null;
    this.pageid = [];
    this.channel = null;
    this.profile = null;
    this.profiles = [];
  }

}
