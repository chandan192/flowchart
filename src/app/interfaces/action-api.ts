export enum ApiArgumentType {
  ANY = 0,
  STRING = 1,
  NUMBER = 2,
  STATE = 3,
  REGEX = 4

}

export class Operator {
  // TODO: update the list.
  // TODO: should be range property to tell what all type of operand are supported.
  static operatorList: any = [{
    name: '=', value: 'IS_EQUAL', range: 0x3
  }, {
    name: '!=', value: 'IS_NOT_EQUAL', range: 0x3
  }, {
    name: 'contains the string', value: 'CONTAIN_STRING', range: 0x1
  }, {
    name: 'contains the string(exact case)', value: 'CONTAIN_STRING_CASE', range: 0x1
  }, {
    name: '<', value: 'LESS_THAN', range: 0x2
  }, {
    name: '<=', value: 'LESS_THAN_EQUAL', range: 0x2
  }, {
    name: '>', value: 'GREATER_THAN', range: 0x2
  }, {
    name: '>=', value: 'GREATER_THAN_EQUAL', range: 0x2
  }];

  getOperatorList(operandType: number): any {
    return [];
  }
}


export class ApiArgument {
  label: string;
  name: string;
  type?: number;
  required = true;
  defaultValue?: any;
}

export class ActionApi {
  label: string;
  id: string;
  api: string;
  arguments: ApiArgument[];
  category: string;
}

export class ActionApiList {
  static apiList: { [key: string]: ActionApi[] } = {
    SPA: [
      {
        category: 'SPA',
        label: 'Page Transition Start',
        id: 'cav_nv_ajax_pg_start',
        api: 'cav_nv_ajax_pg_start',
        arguments: [{
          label: 'Url',
          name: 'url',
          type: ApiArgumentType.STRING,
          required: true
        }, {
          label: 'Page Name',
          name: 'pageName',
          type: ApiArgumentType.STRING,
          required: true
        }]
      }, {
        category: 'SPA',
        label: 'Page Transition End',
        id: 'cav_nv_ajax_pg_end',
        api: 'cav_nv_ajax_pg_end',
        arguments: [{
          label: 'Url',
          name: 'url',
          type: ApiArgumentType.STRING,
          required: true
        }, {
          label: 'Page Name',
          name: 'pageName',
          type: ApiArgumentType.STRING,
          required: true
        }]
      }, {
        category: 'SPA',
        label: 'Transaction Start',
        id: 'startTransaction',
        api: 'CAVNV.startTransaction',
        arguments: [{
          label: 'Txn Name',
          name: 'txn_name',
          type: ApiArgumentType.STRING,
          required: true
        }, {
          label: 'Data',
          name: 'data',
          type: ApiArgumentType.STRING,
          required: true
        }]
      }, {
        category: 'SPA',
        label: 'Transaction End',
        id: 'endTransaction',
        api: 'CAVNV.endTransaction',
        arguments: [{
          label: 'Txn Name',
          name: 'txn_name',
          type: ApiArgumentType.STRING,
          required: true
        }, {
          label: 'Data',
          name: 'data',
          type: ApiArgumentType.STRING,
          required: true
        }]
      }
    ],
    Cookie: [
      {
        category: 'Cookie',
        label: 'Set Cookie',
        id: 'setCookie',
        api: 'CAVNV.utils.setCookie',
        arguments: [{
          label: 'Cookie Name',
          name: 'cookieName',
          type: ApiArgumentType.STRING,
          required: true
        }, {
          label: 'Cookie Value',
          name: 'cookieValue',
          type: ApiArgumentType.STRING,
          required: true
        }]
      }, {
        category: 'Cookie',
        label: 'Remove Cookie',
        id: 'removeCookie',
        api: 'CAVNV.utils.removeCookie',
        arguments: [{
          label: 'Cookie Name',
          name: 'cookieName',
          type: ApiArgumentType.STRING,
          required: true
        }]
      }
    ],
    State: [
      {
        category: 'State',
        label: 'Goto State',
        id: 'gotoState',
        api: 'CAVNV.sb.gotoState',
        arguments: [{
          label: 'State Name',
          name: 'stateName',
          type: ApiArgumentType.STATE,
          required: true
        }]

      }
    ],
    localVarApi: [
      {
        category: 'localVarApi',
        label: 'Store Value',
        id: 'assignValue',
        api: 'CAVNV.sb.assign',
        arguments: [{
          label: 'Local Variable',
          name: 'varName',
          type: ApiArgumentType.ANY,
          required: true
        }, {
          label: 'Value',
          name: 'value',
          type: ApiArgumentType.ANY,
          required: true
        }]
      },
      {
        category: 'localVarApi',
        label: 'Increment',
        id: 'increment',
        api: 'CAVNV.sb.increment',
        arguments: [{
          label: 'Local Variable',
          name: 'varName',
          type: ApiArgumentType.NUMBER,
          required: true
        }, {
          label: 'By',
          name: 'by',
          type: ApiArgumentType.NUMBER,
          defaultValue: 1,
          required: true
        }]
      }, {
        category: 'localVarApi',
        label: 'Decrement',
        id: 'decrement',
        api: 'CAVNV.sb.decrement',
        arguments: [{
          label: 'Local Variable',
          name: 'varName',
          type: ApiArgumentType.ANY,
          required: true
        }, {
          label: 'By',
          name: 'by',
          type: ApiArgumentType.NUMBER,
          defaultValue: 1,
          required: true
        }]
      }, {
        category: 'localVarApi',
        label: 'trim',
        id: 'trim',
        api: 'CAVNV.sb.trim',
        arguments: [{
          label: 'Local Variable',
          name: 'varName',
          type: ApiArgumentType.STRING,
          required: true
        }]
      }, {
        category: 'localVarApi',
        label: 'replace',
        id: 'replace',
        api: 'CAVNV.sb.replace',
        arguments: [{
          label: 'Local Variable',
          name: 'varName',
          type: ApiArgumentType.STRING,
          required: true
        }, {
          label: 'search value',
          name: 'searchVal',
          type: ApiArgumentType.REGEX,
          required: true
        }, {
          label: 'new value',
          name: 'newVal',
          type: ApiArgumentType.STRING,
          required: true
        }]
      }
    ],
    Session_Data: [
      {
        category: 'Session_Data',
        label: 'Set Session Data',
        id: 'cav_nv_set_session_data',
        api: 'cav_nv_set_session_data',
        arguments: [{
          label: 'Key',
          name: 'key',
          type: ApiArgumentType.STRING,
          required: true
        }, {
          label: 'Data',
          name: 'data',
          type: ApiArgumentType.STRING,
          required: true
        }]
      },
    ],
    LoginId: [
      {
        category: 'LoginId',
        label: 'Set LoginId',
        id: 'setLoginId',
        api: 'cav_nv_set_loginid',
        arguments: [{
          label: 'LoginId',
          name: 'loginid',
          type: ApiArgumentType.STRING,
          required: true
        }]
      },
    ],
    SessionId: [
      {
        category: 'SessionId',
        label: 'Set SessionId',
        id: 'cav_nv_set_sessionid',
        api: 'cav_nv_set_sessionid',
        arguments: [{
          label: 'SessionId',
          name: 'SessionId',
          type: ApiArgumentType.NUMBER,
          required: true
        }]
      },
    ],
    LogEvent: [
      {
        category: 'LogEvent',
        label: 'Log Event',
        id: 'eventName',
        api: 'CAVNV.cav_nv_log_event',
        arguments: [{
          label: 'Event Name',
          name: 'eventName',
          type: ApiArgumentType.STRING,
          required: true
        }, {
          label: 'Data',
          name: 'data',
          type: ApiArgumentType.STRING,
          required: true
        }]
      },
    ],
    UserSegment: [
      {
        category: 'UserSegment',
        label: 'Set User Segment',
        id: 'userSegment',
        api: 'cav_nv_set_userSegment',
        arguments: [{
          label: 'User Segment',
          name: 'name',
          type: ApiArgumentType.STRING,
          required: true
        }]
      },
    ],
    CustomMetric: [
      {
        category: 'CustomMetric',
        label: 'Custom Metric',
        id: 'cav_nv_log_customMetrics',
        api: 'cav_nv_log_customMetrics',
        arguments: [{
          label: 'Name',
          name: 'customMatricName',
          type: ApiArgumentType.STRING,
          required: true
        }, {
          label: 'Valus',
          name: 'value',
          type: ApiArgumentType.STRING,
          required: true
        }]
      },
    ],
    OrderTotal: [
      {
        category: 'OrderTotal',
        label: 'Order Total',
        id: 'orderTotal',
        api: 'cav_nv_set_orderTotal',
        arguments: [{
          label: 'Order Total',
          name: 'oederTotal',
          type: ApiArgumentType.STRING,
          required: true
        }]
      },
    ],
    Session_State: [
      {
        category: 'Session_State',
        label: 'Set Session State',
        id: 'set_session_state',
        api: 'CAVNV.set_session_state',
        arguments: [{
          label: 'Session State',
          name: 'sessionState',
          type: ApiArgumentType.STATE,
          required: true
        }]
      },
    ]

  };

  static apiMap: Map<string, ActionApi> = null;
  static getApiData(api: string): ActionApi {
    // Check if map is prepared. If not then create that first.
    if (this.apiMap === null) {
      this.loadApiMap();
    }
    return this.apiMap.get(api);
  }

  static loadApiMap() {
    this.apiMap = new Map();
    // tslint:disable-next-line: forin
    for (const key in this.apiList) {
      this.apiList[key].forEach(api => {
        this.apiMap.set(api.id, api);
      });
    }
  }
}
