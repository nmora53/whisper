import React from 'react';
import { VERSION, IconButton } from '@twilio/flex-ui';
import { FlexPlugin } from 'flex-plugin';

import reducers, { namespace } from './states';

const PLUGIN_NAME = 'SuperwhisperPlugin';

class SuperwhisperPlugin extends FlexPlugin {
  constructor() {
    super(PLUGIN_NAME);
    this.task = null;
    this.callSid = null;
    this.whiperProps = null;
    this.showMyButton = false;
    this.whispering = false;
    this.participants = [];
    this.undoWhisper = this.undoWhisper.bind(this);
    this.doWhisper = this.doWhisper.bind(this);
    this.prepWhisper = this.prepWhisper.bind(this);
  }

  prepWhisper(e) {
    this.whiperProps = e;
    this.showMyButton = true;
    this.whispering = false;
  }

  doWhisper(e, props) {
    this.participants = [];
    this.whiperProps.task.conference.participants.forEach(p => {
      this.participants.push(p.callSid);
    });

    const body = { 
      conferenceSid: this.whiperProps.task.conference.conferenceSid,
      taskSid: this.whiperProps.task.taskSid,
      callSidToCoach: this.whiperProps.task.conference.liveWorkers[0].callSid, 
      existingParticipants: this.participants,
      callSidOfCoach: this.callSid
    };

    const options = {
      method: 'POST',
      body: new URLSearchParams(body),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
      }
    };

    fetch('https://entercoaching-1660.twil.io/startCoaching', options)
      .then(resp => resp.json())
      .then(data => {
        this.whispering = true;
        this.callSid = data.callSid;
        console.log("startCoaching return: ", data);
        fetch('https://entercoaching-1660.twil.io/findCoach', options)
          .then(resp => resp.json())
          .then(data => console.log("conference participants ", data));
      })
  }

  undoWhisper(e) {
    this.whispering = false;
    if(this.callSid) {
      const body = { 
        conferenceSid: this.whiperProps.task.conference.conferenceSid,
        callSidOfCoach: this.callSid
      };
  
      const options = {
        method: 'POST',
        body: new URLSearchParams(body),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
        }
      };
  
      fetch('https://entercoaching-1660.twil.io/stopCoaching', options)
        .then(resp => resp.json())
        .then(data => {
          fetch('https://entercoaching-1660.twil.io/findCoach', options)
            .then(resp => resp.json())
            .then(data => console.log(data));
        })  
      }
    }

  /**
   * This code is run when your plugin is being started
   * Use this to modify any UI components or attach to the actions framework
   *
   * @param flex { typeof import('@twilio/flex-ui') }
   * @param manager { import('@twilio/flex-ui').Manager }
   */
  init(flex, manager) {
    this.registerReducers(manager);

    // Add a nice icon button -- size needs to be controlled, but it appears
    flex.Supervisor.TaskOverviewCanvas.Content.add(
      <IconButton icon="Supervisor" key="startwhisperbutton" onClick={(e, props) => {this.doWhisper(e, props)}} />,
      {
        if:props=>{return(this.showMyButton === true && this.whispering === false);}
      }
      );
    flex.Supervisor.TaskOverviewCanvas.Content.add(
      <IconButton icon="SupervisorBold" key="stopwhisperbutton" onClick={(e) => {this.undoWhisper(e)}} />,
      {
        if:props=>{return(this.showMyButton === true && this.whispering === true);}
      }
    );

    flex.Actions.addListener("afterStopMonitoringCall", (payload) => {
      this.showMyButton = false;
      console.log("Stopping Coaching. ", this, payload);
      if(this.callSid) this.undoWhisper(payload);
    });

    flex.Actions.addListener("afterMonitorCall", (payload) => {
      this.prepWhisper(payload);
      console.log("Started Monitoring. ", this, payload);
    });

  };

  /**
   * Registers the plugin reducers
   *
   * @param manager { Flex.Manager }
   */
  registerReducers(manager) {
    if (!manager.store.addReducer) {
      // eslint: disable-next-line
      console.error(`You need FlexUI > 1.9.0 to use built-in redux; you are currently on ${VERSION}`);
      return;
    }

    manager.store.addReducer(namespace, reducers);
  }
}

export default SuperwhisperPlugin;