import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Action, ActionData, Callback, State, Trigger } from './../../../../interfaces/callback';

@Component({
  selector: 'app-callback-sd-trigger-action',
  templateUrl: './callback-sd-trigger-action.component.html',
  styleUrls: ['./callback-sd-trigger-action.component.css']
})

export class CallbackSdTriggerActionComponent implements OnInit, OnChanges {

  @Input() callback: Callback;
  @Input() currentState: State;
  @Output() flowChartFlag: EventEmitter<any> = new EventEmitter();
  @Output() currentAction: EventEmitter<any> = new EventEmitter();
  // It will be set when new trigger is being added.
  newTriggerName: string = null;
  pendingTriggerCallback: Function = null;
  pendingTriggerData: any = null;
  showTriggerDialog = false;

  // It is for add action callback.
  showActionDialog = false;
  selectedTriggerForAction: any = null;
  addActionFormDirty = false;
  newActionName: string = null;
  pendingActionCallback: Function = null;
  pendingActionData: any = null;
  listOfTrigger: any;
  selectedTrigger: any;
  stateName: any;
  openChart = false;
  triggerList: any[] = [];
  actionList: any = [];
  updateAction = false;

  constructor() {
    // this.listOfAction = this.callback.actions;
    this.listOfTrigger = [];
  }

  ngOnInit() {


    console.log('Calling action trigger OnInit', this.callback);
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('Callback is -', this.callback);

    if (this.callback !== undefined) {
      this.getTriggerList();
      this.getActionList();
    }

  }

  openDialogTrigger(type: string, triggername?: string) {
    this.showTriggerDialog = true;
    this.stateName = this.currentState.id;
    // this.newTriggerName = 'Trigger_' + this.callback.triggers.length + '';
    switch (type) {
      case 'add':
        this.newTriggerName = 'Trigger_' + this.callback.counter['trigger']++;
        break;

      case 'update':
        this.newActionName = triggername;
        break;
    }
  }

  openDialogAction(actionName) {
    console.log('triggerList', this.triggerList);
    this.showActionDialog = true;

    if (actionName !== null) {
      this.updateAction = true;
      this.newActionName = actionName;
    } else {
      this.updateAction = false;
      // this.newActionName = 'Action_' + this.callback.actions.length + '';
      this.newActionName = 'Action_' + this.callback.counter['action']++;


    }
    // this.actionList();
  }

  submitAddAction() {
    if (this.selectedTriggerForAction === null) {
      console.log('Trigger not selected.');
      this.addActionFormDirty = true;
    } else {
      const action = new Action(this.newActionName);
      action.data = new ActionData();
      action.stateId = this.selectedTriggerForAction.stateId;
      action.triggerId = this.selectedTriggerForAction.id;
      if (this.updateAction === false) {
        action.id = 'action_' + this.callback.actions.length;
        this.callback.actions.push(action);

      } else {
        action.id = 'action_' + this.newActionName.split('_')[1];
        for (let i = 0; i < this.callback.actions.length; i++) {
          if (this.callback.actions[i].name === this.newActionName) {
            this.callback.actions[i] = action;
          }
        }
      }


      console.log('callback - dirty : ', this.callback.dirty);

      this.callback.dirty = true;

      // this.listOfAction = this.callback.actions;
      // Note: We can have same callback for multiple trigger. That is why need to maintain mapping.

      // this.pendingActionData.text = action.name;
      // this.pendingActionData.id = action.id;

      // Add mapping.
      const map = new Map();
      map.set('state', this.selectedTriggerForAction.stateId);
      map.set('trigger', this.selectedTriggerForAction.id);
      this.callback.actionMap = new Map();
      this.callback.actionMap.set(action.id, map);

      // add node.
      // this.pendingActionCallback(this.pendingActionData);
      // this.pendingActionCallback = null;
      // this.pendingActionData = null;
      this.newActionName = null;
      this.showActionDialog = false;

      // add edge.
      // setTimeout(() => {
      //   this.toolkit.addEdge({ source: map.get('trigger'), target: action.id });
      // }, 100);

      // TODO: It has to be taken care by double click.
      console.log('Emitting actionAdded event with data - ', action);
      this.getActionList();
      // this.actionAdded.emit(action);
    }
  }

  openActionDialog() {
    console.log('dialog opened');
    this.showActionDialog = true;

  }



  addTriggerNode($event: any) {
    console.log('Trigger Added Successfully, event - ', $event);
    this.showTriggerDialog = false;
    this.newTriggerName = null;

    const trigger: Trigger = $event as Trigger;

    // update trigger
    if (this.callback.triggers.length) {
      for (let i = 0; i < this.callback.triggers.length; i++) {
        if (this.callback.triggers[i].name === trigger.name) {
          this.callback.triggers[i] = trigger;
          this.callback.dirty = false;
          this.getTriggerList();
          return;
        }
      }
    }

    //add trigger
    trigger.id = 'trigger_' + this.callback.triggers.length;
    const tempTrigger = { label: this.newTriggerName, value: this.newTriggerName };
    this.listOfTrigger.push(tempTrigger);
    this.callback.triggers.push(trigger);
    this.callback.dirty = true;

    // this.listOfTrigger = this.callback.triggers;
    this.getTriggerList();
    console.log('After Adding Trigger', this.callback);

  }


  openflowChart(action) {
    console.log('Current Action', action);
    this.openChart = true;
    this.currentAction.emit(action);
    this.flowChartFlag.emit(this.openChart);
  }
  getTriggerList() {
    this.triggerList = [];
    console.log('current State', this.currentState, this.callback.triggers);

    if (this.callback.triggers.length) {
      this.callback.triggers.forEach(trigger => {
        if (trigger.stateId === this.currentState.id) {
          this.triggerList.push(trigger);
        }
      });
    }

    console.log('list of trigger', this.triggerList);
    return this.triggerList;
  }
  getActionList() {
    this.actionList = [];
    console.log('current State', this.currentState, this.callback.actions);
    this.callback.actions.forEach(action => {
      if (action.stateId === this.currentState.id) {
        this.actionList.push(action);
      }
    });
    return this.actionList;
  }

  editTrigger(trigger) {
    console.log('edit trigger function called : ', trigger);

    this.showTriggerDialog = true;
    this.newTriggerName = trigger.name;

    this.openDialogTrigger('update', trigger.name);
  }

  deleteTrigger(triggerid) {
    console.log('delete trigger function called : ', triggerid);

    this.callback.triggers.forEach((item, i) => {
      if (item.id === triggerid) {
        this.callback.triggers.splice(i, 1);
      }
    });

    this.getTriggerList();
  }


}
