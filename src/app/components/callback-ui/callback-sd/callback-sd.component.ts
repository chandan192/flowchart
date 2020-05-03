import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { Dialogs, DrawingTools, jsPlumbToolkit, Surface } from 'jsplumbtoolkit';
import { jsPlumbService, jsPlumbSurfaceComponent } from 'jsplumbtoolkit-angular';
import { TreeNode } from 'primeng/api';
import { Action, Callback, JtkNodeParam, State, StateType, Trigger } from './../../../interfaces/callback';
import { CallbackDataServiceService } from './../../../services/callback-data-service.service';
import { CallbackDesignerComponent } from './../callback-designer/callback-designer.component';
import { EndNodeComponent, OutputNodeComponent, QuestionNodeComponent, SDActionNodeComponent, StartNodeComponent, StateNodeComponent } from './../flowchart-common/flowchart-common.component';

@Component({
  selector: 'app-callback-sd',
  templateUrl: './callback-sd.component.html',
  styleUrls: ['./callback-sd.component.css']
})
export class CallbackSdComponent implements OnInit, OnChanges {

  constructor(private $jsplumb: jsPlumbService, private cdService: CallbackDataServiceService) {
    this.toolkitId = 'callbackSD';
    this.surfaceId = 'callbackSDSurface';
    // initialize dialogs
    Dialogs.initialize({
      selector: '.dlg'
    });

    this.sdToolbarTreeData = [
      {
        label: 'State',
        data: {
          type: 'state',
          w: 120,
          h: 70
        },
        icon: 'fa fa-file'
      }];


  }


  @ViewChild('drawer2') drawer: any;
  @ViewChild('drawer3') drawer3: any;
  @ViewChild('api') api: any;
  @ViewChild(jsPlumbSurfaceComponent) surfaceComponent: jsPlumbSurfaceComponent;

  @Output() actionAdded: EventEmitter<any> = new EventEmitter();
  @Output() stateAdded: EventEmitter<any> = new EventEmitter();
  @Input() callback: Callback;
  @Input() activeTabIndex: any = null;
  @Output() activeTabIndexChange: EventEmitter<any> = new EventEmitter();
  @Input() currentState: State = null;
  @Input() openFlag = false;
  @Output() openFlagChanged: EventEmitter<any> = new EventEmitter();
  @Input() action: Action;
  toolkit: jsPlumbToolkit;
  surface: Surface;
  showTriggerDialog = false;
  sidebarLoaded = false;
  currentAction: Action = null;

  isFirstTimeLoaded = false;

  private stateDiagramData: any = null;

  // It will be set when new trigger is being added.
  newTriggerName: string = null;
  pendingTriggerCallback: Function = null;
  pendingTriggerData: any = null;

  // It is for add action callback.
  showActionDialog = false;
  selectedTriggerForAction: any = null;
  addActionFormDirty = false;
  newActionName: string = null;
  pendingActionCallback: Function = null;
  pendingActionData: any = null;

  toolkitId: string;
  surfaceId: string;
  stateEdge: any = [];

  nodeTypes = [
    { label: 'State', type: 'state', w: 100, h: 70 },
    { label: 'Trigger', type: 'trigger', w: 120, h: 70 },
    { label: 'Action', type: 'action', w: 120, h: 70 }
  ];

  sdToolbarTreeData: TreeNode[] = [];

  // dataGenerator(type: string, el: Element) {
  //   let data = {
  //     type: el.getAttribute('jtk-node-type'),
  //     w: parseInt(el.getAttribute('jtk-width'), 10),
  //     h: parseInt(el.getAttribute('jtk-height'), 10),
  //   };

  //   // check if this is action-api then return api data too.
  //   console.log('dataGenerator on element - ', el);
  //   if (el.getAttribute('api') !== null) {
  //     data['api'] = el.getAttribute('api');
  //   }

  //   return data;
  // }

  jtkNodeData: JtkNodeParam;
  newJData = {
    w: null,
    h: null,
    top: null,
    left: null
  };

  Jdata: any;
  toolkitParams = {
    nodeFactory: (type: string, data: any, callback: Function) => {
      if (this.callback == null) {
        console.log('No Callback selected.');
        return;
      }

      switch (type) {
        case 'state':
          // add a state.
          const Jdata = { w: 100, h: 70 };
          const state = new State('State_' + this.callback.states.length, StateType.NORMAL, Jdata);
          state.id = 'state_' + this.callback.states.length;
          this.callback.states.push(state);
          console.log('callback - dirty : ', this.callback.dirty);

          this.callback.dirty = true;

          console.log('Emitting stateAdded event with data - this.Jdata ', state);
          // this.activeTabIndex = CallbackDesignerComponent.TriggerActionSideBar;
          console.log('activeTab - ', this.activeTabIndex);
          this.stateAdded.emit(state);

          // add node.
          data.text = state.text;
          data.id = state.id;
          data.jData = state.jData;
          callback(data);
          break;
        case 'trigger':
          // add new trigger.
          this.newTriggerName = 'Trigger_' + this.callback.triggers.length + '';
          this.pendingTriggerData = data;
          this.pendingTriggerCallback = callback;
          this.showTriggerDialog = true;
          break;
        case 'action':
          this.newActionName = 'Action_' + this.callback.actions.length;
          this.pendingActionData = data;
          this.pendingActionCallback = callback;
          this.showActionDialog = true;
          break;
      }
    },
    beforeStartConnect: (node: any, edgeType: string) => {
      return { label: '...' };
    }
  };


  sideNav: any;

  selectAccord = false;

  view = {
    nodes: {
      start: {
        template: 'StartNode',
        parent: 'selectable'
      },
      end: {
        template: 'EndNode'
      },
      selectable: {
        events: {
          tap: (params: any) => {
            console.log('Selected State', this.currentState);
            this.toggleSelection(params.node);
          }
        }
      },
      trigger: {
        parent: 'selectable',
        template: 'QuestionNode'
      },
      state: {
        parent: 'selectable',
        template: 'StateNode'
      },
      action: {
        parent: 'selectable',
        template: 'ActionNode'
      }
    },
    edges: {
      default: {
        anchor: 'AutoDefault',
        endpoint: 'Blank',
        // connectorStyle: { strokeStyle: "#5C96BC", lineWidth: 2 },
        connector: ['StateMachine'],
        // connector: ["Flowchart", { curviness: 10 }],
        paintStyle: { strokeWidth: 2, stroke: '#f76258', outlineWidth: 3, outlineStroke: 'transparent' },	// 	paint style for this edge type.
        hoverPaintStyle: { strokeWidth: 2, stroke: 'rgb(67,67,67)' }, // hover paint style for this edge type.
        events: {
          dblclick: (params: any) => {
            Dialogs.show({
              id: 'dlgConfirm',
              data: {
                msg: 'Delete Edge'
              },
              onOK: () => { this.removeEdge(params.edge); }
            });
          }
        },
        overlays: [
          ['Arrow', { location: 1, width: 10, length: 10 }],
          ['Label', {
            label: '${label}',
            location: 0.4,
            events: {
              click: (params: any) => {
                // trigger event to open flowchart.
                this.cdService.broadcast('openActionFlowChart', params);
                this.selectAccord = true;
                this.openFlagChanged.emit(this.selectAccord);
              }
            }
          }]

        ]
      },
      connection: {
        parent: 'default',
        overlays: [
          [
            'Label', {
              label: '${label}',
              events: {
                click: (params: any) => {
                  // trigger event to open flowchart.
                  this.cdService.broadcast('openActionFlowChart', params);
                }
              }
            }
          ]
        ]
      }
    },
    ports: {
      start: {
        endpoint: 'Blank',
        anchor: 'Continuous',
        uniqueEndpoint: true,
        edgeType: 'default'
      },
      source: {
        endpoint: 'Blank',
        paintStyle: { fill: '#84acb3' },
        anchor: 'AutoDefault',
        maxConnections: -1,
        edgeType: 'connection'
      },
      target: {
        maxConnections: -1,
        endpoint: 'Blank',
        anchor: 'AutoDefault',
        paintStyle: { fill: '#84acb3' },
        isTarget: true
      }
    }
  };

  renderParams = {
    layout: {
      type: 'Spring'
    },
    events: {
      canvasClick: (e: Event) => {
        this.toolkit.clearSelection();
      },
      edgeAdded: (params: any) => {
        if (params.addedByMouse) {
          this.editLabel(params.edge);
        }
      }
    },
    consumeRightClick: false,
    dragOptions: {
      filter: '.jtk-draw-handle, .node-action, .node-action i'
    }
  };
  ApiMenu = false;
  ngOnInit() {

    console.log('Calling sd OnInit', this.callback);
    // get the toolkit instance
    this.toolkit = this.$jsplumb.getToolkit(this.toolkitId, this.toolkitParams);

    this.toolkit.bind('dataUpdated', this.dataUpdateListener.bind(this));

    // Set listener to refresh edges.
    this.cdService.on('refreshSDEdge').subscribe(data => this.refreshEdges(data));
  }

  refreshEdges(data) {
    console.log('on goto refreshSDEdge event triggered for state - ', data, this.action);

    const edges = [];
    if (this.callback !== undefined) {
      this.callback.actions.forEach(action => {
        action.data.aNOdes.forEach(node => {
          if (node.data.api.api === 'CAVNV.sb.gotoState') {
            const srcState = action.stateId;
            let dstState;
            if (node.data.argument['stateName'] === 'start') {
              dstState = 'start';
            } else if (node.data.argument['stateName'] === 'end') {
              dstState = 'end';
            } else {
              dstState = node.data.argument['stateName'];
            }
            // TODO: take trigger name instead of id.
            const label = '(' + action.triggerId.replace('trigger_', 't') + ',' + action.id.replace('action_', 'a') + ')';
            // Add edge.
            // let data = "[ " + action.id + " ," + action.triggerId + " ]";
            edges.push({
              source: srcState,
              target: dstState,
              data: {
                label,
                actionId: action.id
              }
            });
          }
        });
      });
    }

    // clean existing edges.
    this.toolkit.getAllEdges().forEach(edge => this.toolkit.removeEdge(edge));

    edges.forEach(edge => {

      this.callback.states.forEach(state => {
        if (edge.source === state.id) {
          this.toolkit.addEdge(edge);
        }
      });
    });

    setTimeout(() => {
      // check for all overlay and set their label.
      this.toolkit
    }, 300);

    // this.callback.actions.forEach(action => {
    //   action.data.aNOdes.forEach(api => {
    //     if (api.data.api === 'CAVNV.sb.gotoState') {
    //       let srcState = action.stateId;
    //       let dstState;
    //       if (api.data.arguments.get('stateName') === 'start') {
    //         dstState = 'start';
    //       } else if (api.data.arguments.get('stateName') === 'end') {
    //         dstState = 'end';
    //       } else {
    //         dstState = api.data.arguments.get('startName');
    //       }
    //       //Add edge for this trigger.
    //       edges.push({
    //         id: edges.length,
    //         source: srcState,
    //         target: dstState,
    //         data : data
    //       });
    //     }
    //   })
    // });
    console.log('state to state edge', edges);
    // return edges;
  }

  copyJData(input: any, out: any) {
    if (!input) { return; }

    const keys = ['w', 'h', 'top', 'left'];
    keys.forEach(key => {
      if (input[key] !== undefined) {
        out[key] = input[key];
      }
    });

    return true;
  }

  // TODO: Move to some common util file.
  updateBTInfo(toolKitData: any) {
    toolKitData.edges = this.stateEdge;
    if (toolKitData) {
      toolKitData.nodes.forEach((node: any) => {

        if (node.type === 'state' || node.type === 'start' || node.type === 'end') {
          this.callback.states.some(state => {
            if (node.id === state.id) {
              if (state.jData === undefined) {
                state.jData = new JtkNodeParam();
              }

              return this.copyJData(node, state.jData);
            }
            return false;
          });
        } else if (node.type === 'trigger') {
          this.callback.triggers.some(trigger => {
            if (node.id === trigger.id) {
              if (trigger.jData === undefined) {
                trigger.jData = new JtkNodeParam();
              }
              return this.copyJData(node, trigger.jData);
            }
            return false;
          });
        } else if (node.type === 'action') {
          this.callback.actions.some(action => {
            if (node.id === action.id) {
              if (action.jData === undefined) {
                action.jData = new JtkNodeParam();
              }
              return this.copyJData(node, action.jData);
            }
            return false;
          });
        }
      });
    }

    setTimeout(() => this.removeNodes(), 100);

    console.log('callback after updateBTInfo - ', this.callback);
  }

  dataUpdateListener() {
    console.log('JSPlumb data updated - ', this.toolkit.exportData());
    // TODO: update jsplumb data.
    const tempToolkitData = Object(this.toolkit.exportData());
    this.updateBTInfo(tempToolkitData);


    // FIXME : Nedd to Handle it properly
    // ISSUE : this is called multiple times
    // if (this.isFirstTimeLoaded === false) {
    // this.callback.dirty = true;
    // }

    // this.isFirstTimeLoaded = false;

    console.log('State Data on callback', this.callback, tempToolkitData, this.stateEdge);
  }


  removeNodes() {
    const tempToolkitData = Object(this.toolkit.exportData());
    console.log('removeNodes tempToolkitData ----', tempToolkitData, this.callback);

    this.callback.states = tempToolkitData.nodes;
    const edges = tempToolkitData.edges;

    console.log('edges after removing node', edges);

    const actionArr = [];
    this.callback.actions.forEach(action => {
      actionArr.push(action.stateId);
    });
    const stateArr = [];
    this.callback.states.forEach(state => {
      stateArr.push(state.id);
    });
    const triggerArr = [];
    this.callback.triggers.forEach(trigger => {
      triggerArr.push(trigger.stateId);
    });

    const aNodeIdArr = [];

    const StateSet = new Set(stateArr);
    const actionDiff = ([...actionArr].filter(x => !StateSet.has(x)))[0];
    const triggerDiff = ([...triggerArr].filter(x => !StateSet.has(x)))[0];

    let ind = 0;
    let aNOdesInd = 0;
    let delAnodeInd;
    let delindex;
    let indTrigger = 0;
    let delTriggerInd;
    let deleting: any;
    let edgeInd = 0;
    let deledgeInd;
    this.callback.actions.forEach(action => {
      if (action.stateId === actionDiff) {
        delindex = ind;
        this.callback.actions.splice(delindex, 1);
        // ind = this.callback.triggers.findIndex(x=>x.stateId === trigger.stateId);
        // console.log("data on delete =====>",action ,"index --->",this.callback.actions.findIndex(x=>x.stateId === action.stateId));
      }
      ind++;
      action.data.aNOdes.forEach(aNode => {
        aNodeIdArr.push(aNode.id);
        if (aNode.data.argument['stateName'] === actionDiff) {
          delAnodeInd = aNOdesInd;
          deleting = action.data.aNOdes[delAnodeInd];
          console.log('- delete Diff target', deleting);
          action.data.aNOdes.splice(delAnodeInd, 1);
        }
        aNOdesInd++;
      });
      action.data.edges.forEach(edge => {
        // edgeTargetArr.push(edge.target);
        if (deleting) {
          if (edge.target === deleting.id) {
            deledgeInd = edgeInd;
            console.log('- delete data', edge, deledgeInd, action.data.edges);
            action.data.edges.splice(deledgeInd, 1);
          }
        }
        edgeInd++;
      });
    });


    // aNodeSet = new Set(aNodeIdArr);
    // edgeTargetDiff = ([...edgeTargetArr].filter(x => !aNodeSet.has(x)));


    // // console.log("- delete Diff target",deleting);
    // let edgeInd = 0;
    // let deledgeInd;

    // this.callback.actions.forEach(action =>{
    //   action.data.edges.forEach(edge =>{
    //     edgeTargetDiff.forEach(data=> {
    //       if (edge.target === data ){
    //         deledgeInd = edgeInd;
    //         // console.log(deledgeInd ," - delete from -", edgeTargetDiff);
    //       }
    //       edgeInd++;
    //     })
    //   })
    // })



    this.callback.triggers.forEach(trigger => {
      if (trigger.stateId === triggerDiff) {
        delTriggerInd = indTrigger;
        this.callback.triggers.splice(delTriggerInd, 1);
      }
      indTrigger++;
    });

    // this.toolkit.getAllEdges().forEach(edge => this.toolkit.removeEdge(edge));

    // tempToolkitData.edges.forEach(edge => {
    //   this.callback.states.forEach(state => {
    //     if (edge.source === state.id)
    //       this.toolkit.addEdge(edge);
    //   })
    // });






    // let flag : boolean = false;
    // let ind;
    // for(let i in this.callback.actions){
    //   for(let j in this.callback.states){
    //     if(this.callback.actions[i].stateId != this.callback.states[j].id){
    //       console.log("-->"+i);
    //     }
    //     else {

    //     }
    //   }
    //   // if(action == true && state == false){
    //   //   console.log("Action deleted",this.callback,this.callback.actions ,this.callback.actions.splice(parseInt(i),1) );
    //   // }
    // }

    // let ind;
    // this.callback.triggers.forEach(trigger =>{
    //   this.callback.states.forEach(state =>{
    //     if(trigger.stateId !== state.id){
    //       ind = this.callback.triggers.findIndex(x=>x.stateId === trigger.stateId);
    //       console.log("deleting element",ind);
    //       // this.callback.triggers.splice(ind,1);
    //       // this.callback.triggers.splice(this.callback.triggers.indexOf(removetr),1);
    //     }
    //   });
    // });


    // let ind2;
    // this.callback.actions.forEach(action =>{
    //   this.callback.states.some(state =>{
    //     if(action.stateId == state.id){
    //       ind2 = this.callback.actions.findIndex(x=>x.stateId === action.stateId);
    //       console.log("deleting element -",ind2);
    //     }
    //   })
    // })
    // this.callback.actions.splice(ind2,1);

    console.log('after removing', this.callback);

    // this.toolkit.getAllEdges().forEach(edge => this.toolkit.removeEdge(edge));

    // tempToolkitData.edges.forEach(edge => this.toolkit.addEdge(edge));
  }

  closeDrawer() {
    this.openFlag = false;
    this.sideNav = CallbackDesignerComponent.STATE_DIAGRAM_TAB;
    this.openFlagChanged.emit(this.openFlag);
    this.drawer.close();
  }

  // FIXME: Currently it is loading stateDiagramData all the time. It should do only if callback is changed.
  ngOnChanges(changes: SimpleChanges) {
    // for (let change in changes) {

    //   if (changes[change].firstChange || (changes[change].previousValue != changes[change].currentValue)) {
    //     if (change === 'callback') {

    //     } else if (change === 'openFlag') {
    //       this.openFlag == true && this.drawer &&
    //     }
    //   }
    // }

    for (const change in changes) {
      if (change === 'openFlag') {
        if (this.openFlag == true && this.drawer) {
          this.drawer.open();
          this.sideNav = CallbackDesignerComponent.TriggerActionSideBar;
          this.openFlag = false;
        }
      } else if (change === 'callback') {

        this.isFirstTimeLoaded = true;
        if (!changes[change].firstChange) {
          this.toolkit.clear();
        }

        if (this.callback === null) { return; }


        console.log('callback and ActivetabIndex in sd', this.openFlag, this.callback, this.activeTabIndex, this.currentState);

        this.stateDiagramData = this.getStateDiagramData();

        if (this.toolkit) {

          this.toolkit.load({ data: this.stateDiagramData });

          // add edges too.
          setTimeout(() => this.refreshEdges('none'), 300);
        } else {
          // it will be set once toolkit is found.
        }

      }
    }

  }

  getStateDiagramData() {
    console.log('swithing b/w callbacks getStateDiagramData', this.callback);
    const sdData = {
      nodes: [],
      edges: []
    };
    if (this.callback) {

      this.callback.states.forEach(state => {
        switch (state.type) {
          case StateType.Start:
            // TODO: Need to remember node position.
            sdData.nodes.push({
              id: 'start',
              type: 'start',
              text: 'Start',
              w: 100,
              h: 70
            });
            break;
          case StateType.End:
            sdData.nodes.push({
              id: 'end',
              type: 'end',
              text: 'End',
              w: 100,
              h: 70
            });
            break;
          default:
            sdData.nodes.push({
              id: state.id,
              type: 'state',
              text: state.text,
              w: 100,
              h: 70
            });
        }


        this.copyJData(state.jData, sdData.nodes[sdData.nodes.length - 1]);
      });

    }

    // Iterate triggers.
    // this.callback.triggers.forEach(trigger => {
    //   sdData.nodes.push({
    //     "id": trigger.id,
    //     "type": "trigger",
    //     "text": trigger.name
    //   })

    // this.copyJData(trigger.jData, sdData.nodes[sdData.nodes.length - 1]);

    // Add edge for this trigger.
    //   sdData.edges.push({
    //     id: sdData.edges.length,
    //     source: trigger.stateId,
    //     target: trigger.id
    //   });
    // });

    // this.callback.actions.forEach(action => {
    //   sdData.nodes.push({
    //     "id": action.id,
    //     "type": "action",
    //     "text": action.name
    //   });
    // this.copyJData(action.jData, sdData.nodes[sdData.nodes.length - 1]);
    // });

    // make edge for trigger to action.
    // for (let actionId in this.callback.actionMap) {
    //   sdData.edges.push({
    //     id: sdData.edges.length,
    //     source: this.callback.actionMap.get(actionId).get('trigger'),
    //     target: actionId
    //   });
    // }

    console.log('sdData - ', sdData);

    return sdData;
  }

  closeSideBar() {
    this.activeTabIndex = CallbackDesignerComponent.STATE_DIAGRAM_TAB;
    this.sideNav = CallbackDesignerComponent.STATE_DIAGRAM_TAB;
    this.activeTabIndexChange.emit(this.activeTabIndex);
  }
  flowChartFlag($event) {
    console.log('flowchart -- ', $event);
    // this.drawer3.open();
    this.sideNav = CallbackDesignerComponent.FLOW_CHART_TAB;
  }

  closeDrawerFlowchart() {
    this.sideNav = CallbackDesignerComponent.TriggerActionSideBar;
  }

  /*
    (type:string, data:any, callback:Function) => {
      Dialogs.show({
        id: "dlgText",
        title: "Enter " + type + " name:",
        onOK: (d:any) => {
          data.text = d.text;
          // if the user entered a name...
          if (data.text) {
            // and it was at least 2 chars
            if (data.text.length >= 2) {
              // set an id and continue.
              data.id = jsPlumbToolkitUtil.uuid();
              callback(data);
            }
            else
            // else advise the user.
              alert(type + " names must be at least 2 characters!");
          }
          // else...do not proceed.
        }
      });
    }*/


  addTriggerNode($event: any) {
    console.log('Trigger Added Successfully, event - ', $event);

    const trigger: Trigger = $event as Trigger;
    trigger.id = 'trigger_' + this.callback.triggers.length;
    this.pendingTriggerData.text = trigger.name;
    this.pendingTriggerData.id = trigger.id;
    this.pendingTriggerCallback(this.pendingTriggerData);
    this.pendingTriggerCallback = null;
    this.pendingTriggerData = null;
    this.showTriggerDialog = false;
    this.newTriggerName = null;

    this.callback.triggers.push(trigger);

    // Check if state name is given then add the edge.
    setTimeout(() => {
      this.toolkit.addEdge({
        source: trigger.stateId,
        target: trigger.id
      });
    }, 100);
  }

  resolveNode(typeId: string) {
    return ({
      QuestionNode: QuestionNodeComponent,
      ActionNode: SDActionNodeComponent,
      StartNode: StartNodeComponent,
      EndNode: EndNodeComponent,
      OutputNode: OutputNodeComponent,
      StateNode: StateNodeComponent
    })[typeId];
  }

  getToolkit(): jsPlumbToolkit {
    return this.toolkit;
  }

  toggleSelection(node: any) {
    this.toolkit.toggleSelection(node);
  }

  removeEdge(edge: any) {
    this.toolkit.removeEdge(edge);
  }

  editLabel(edge: any) {
    Dialogs.show({
      id: 'dlgText',
      data: {
        text: edge.data.label || ''
      },
      onOK: (data: any) => {
        this.toolkit.updateEdge(edge, { label: data.text });
      }
    });
  }

  typeExtractor(el: Element) {
    return el.getAttribute('jtk-node-type');
  }

  dataGenerator(type: string, el: Element) {
    return {
      type: el.getAttribute('jtk-node-type'),
      w: parseInt(el.getAttribute('jtk-width'), 10),
      h: parseInt(el.getAttribute('jtk-height'), 10)
    };
  }

  ngAfterViewInit() {
    this.surface = this.surfaceComponent.surface;
    this.toolkit = this.surface.getToolkit();

    new DrawingTools({
      renderer: this.surface
    });

    if (this.stateDiagramData) {
      this.toolkit.load({ data: this.stateDiagramData });

      // add edges too.
      setTimeout(() => this.refreshEdges('none'), 300);
    }
    // this.toolkit.load({ url:"assets/data/flowchart-small.json" });
  }

  ngOnDestroy() {
    console.log('flowchart being destroyed');
  }

  openDialog() {
    this.showTriggerDialog = true;
  }

  submitAddAction() {
    if (this.selectedTriggerForAction === null) {
      console.log('Trigger not selected.');
      this.addActionFormDirty = true;
    } else {
      const action = new Action(this.newActionName);
      action.id = 'action_' + this.callback.actions.length;
      this.callback.actions.push(action);

      this.callback.dirty = true;

      // Note: We can have same callback for multiple trigger. That is why need to maintain mapping.

      this.pendingActionData.text = action.name;
      this.pendingActionData.id = action.id;

      // Add mapping.
      const map = new Map();
      map.set('state', this.selectedTriggerForAction.stateId);
      map.set('trigger', this.selectedTriggerForAction.id);
      this.callback.actionMap.set(action.id, map);

      // add node.
      this.pendingActionCallback(this.pendingActionData);
      this.pendingActionCallback = null;
      this.pendingActionData = null;
      this.newActionName = null;
      this.showActionDialog = false;

      // add edge.
      setTimeout(() => {
        this.toolkit.addEdge({ source: map.get('trigger'), target: action.id });
      }, 100);

      // TODO: It has to be taken care by double click.
      console.log('Emitting actionAdded event with data - ', action);
      this.actionAdded.emit(action);
    }
  }
  openApiMenu() {
    this.ApiMenu = true;
  }
  closeApiMenu() {
    this.ApiMenu = false;
  }

  currentActionGet($event) {
    console.log('On CurrentAction', $event);
    this.currentAction = $event;
  }


}
