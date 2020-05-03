import { ActionApi } from './action-api';

export enum StateType {
  Start = 1,
  End,
  NORMAL
}

export enum FCNodeType {
  CONDITION = 0,
  ACTIONAPI
}

// It is just to remove node position and height/width.
export class JtkNodeParam {
  h: number;
  w: number;
  top: number;
  left: number;
}
/*
 *  type : state , w , h , left , top , text , id
    type: string = "state";
    w: number;
    h: number;
    left: number;
    top: number;
    text: string;
    id: string;
 */


export class State {
  text: string;
  id: string;
  type: number;
  jData: JtkNodeParam = new JtkNodeParam();

  constructor(text: string, type: number, jData) {
    this.text = text;
    this.type = type;
    this.jData = jData;
  }
}

export class Trigger {
  state: string;
  stateId: string;
  name: string;
  jData: JtkNodeParam = new JtkNodeParam();
  // Unique id for each trigger. It can be same as triggerName
  id: string;
  type: string;
  domSelector: string;
  urlSelector: string;
}

export class ConditionData {
  lhs: string;
  rhs: string;
  operator: string;
}

export class ConditionNode {
  type: number;
  dirty = false;
  data: ConditionData;
  id: string;
  text: string;
  jData: JtkNodeParam = new JtkNodeParam();
}

export class ActionApiData {
  // It will be actual api eg. CAVNV.utils.setCookie.
  // TODO: it is better to provide uniq id to each api and use it here.
  /*api: string;
  id: string;*/
  api: ActionApi;
  argument: Map<string, string>;
}

export class ActionApiCallingNodes {
  dirty = false;
  id: string;
  text: string;
  data: ActionApiData;
  jData: JtkNodeParam = new JtkNodeParam();
}

export class ActionEdge {
  source: string;
  target: string;
  data: Map<string, string>;
}

export class ActionData {
  // Condition node.
  cNodes: ConditionNode[] = [];
  // Action api node.
  aNOdes: ActionApiCallingNodes[] = [];
  edges: ActionEdge[] = [];
  startNodeJData: JtkNodeParam;
}

export class Action {
  dirty = false;
  placeHolderNodes = 0;
  state: string;
  stateId: string;
  triggerId: string;
  id: string;
  name: string;
  data: ActionData = new ActionData();
  jData: JtkNodeParam = new JtkNodeParam();

  constructor(name: string) {
    this.name = name;
  }
}

export class DataPoint {
  id: string;
  name: string;
  type: string;
  selector: string;
  pattern: string;
  patternIndex: number;
}

export class LocalVariable {
  name: string;
  // TODO:
  type?: number = 0;
}

/*This class is for storing callback's */
export class CallBackData {
  name: string;
  description: string;
  onTrigger: any;
  value: any;
  pages: string;
  channel: number;
  jsondata: Callback;
  group: any;
  profilename: string;
  constructor(name, onTrigger, description, value, pages, channel, profilename, jsondata) {
    this.name = name;
    this.group = description;
    this.onTrigger = onTrigger;
    this.value = value;
    this.pages = pages;
    this.channel = channel;
    this.profilename = profilename;
    this.jsondata = jsondata;
  }
}

export class Callback {
  dirty = false;
  counter: any = {
    trigger: 0,
    action: 0,
    condition: 0,
    api: 0
  };
  states: State[] = [];
  triggers: Trigger[] = [];
  actions: Action[] = [];
  actionMap: Map<string, Map<string, string>> = new Map();
  dataPoints: DataPoint[] = [];
  localVariables: LocalVariable[] = [];

  constructor() {
    // Add start and end state.
    const startState = new State('start', StateType.Start, JtkNodeParam);
    const endState = new State('end', StateType.End, JtkNodeParam);

    startState.id = 'start';
    this.states.push(startState);
    endState.id = 'end';
    this.states.push(endState);
  }
}
