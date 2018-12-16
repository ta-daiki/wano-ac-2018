import React from 'react';
import {render} from 'react-dom';

import {faust} from './DelayEffector.js';

class DelayEffector extends React.Component {
  constructor() {
    super();

    this.state = {
      audioCtx: null,
      audioData: null,
      samplerNode: null,
      delayNode: null,
      effectBypass: false,
      delayTimeMsec: 100,
      feedbackGain: 0.3,
      drive: 1.0,
      cutoffFreqHz: 1000,
      wetness: 0.5,
    }

    this.paramName2faustAdressName = {
      delayTimeMsec: "/DelayEffector/Delay/Delay_Time_(msec)",
      feedbackGain: "/DelayEffector/Delay/Delay_Feedback",
      wetness: "/DelayEffector/Delay/Wet",
      drive: "/DelayEffector/SubEffector/Drive",
      cutoffFreqHz: "/DelayEffector/SubEffector/Cutoff_Frequency_(Hz)",
    }
  }

  componentDidMount() {
    const audioCtx = new AudioContext();
    this._loadAudioFile(audioCtx, './SampleLoop.wav');
    this._setUpRooting(audioCtx);
    this.setState({
      audioCtx: audioCtx
    });
  }

  _loadAudioFile(audioCtx, path) {
    const req = new XMLHttpRequest();
    req.open("GET", path, true);
    req.responseType = "arraybuffer";
    req.onload = () => {
      if(!req.response) return;
      audioCtx.decodeAudioData(req.response).then(decodeBuff => this.setState({audioData: decodeBuff}))
    };
    req.send();
  }

  _setUpRooting(audioCtx) {
    const samplerNode = audioCtx.createBufferSource();
    faust.createDelayEffector(audioCtx, 1024, (delayNode) => {
      console.log(delayNode.getParams());
      samplerNode.connect(delayNode);
      delayNode.connect(audioCtx.destination);
      this.setState({delayNode: delayNode});
    })
    this.setState({samplerNode: samplerNode});
  }


  playAudio() {
    const samplerNode = this.state.samplerNode;
    samplerNode.buffer = this.state.audioData;
    samplerNode.loop = true;
    samplerNode.start();
  }

  onChangeBypass(ev) {
    const effectBypass = ev.target.checked;
    const val = effectBypass ? 0 : this.state.wetness;
    const delayNode = this.state.delayNode;

    delayNode.setParamValue(this.paramName2faustAdressName["wetness"], parseFloat(val));
    this.setState({ effectBypass: effectBypass });
  }

  onChangeWetness(ev) {
    const val = ev.target.value;
    const effectBypass = this.state.effectBypass;

    if (!effectBypass) {
      const delayNode = this.state.delayNode;
      delayNode.setParamValue(this.paramName2faustAdressName["wetness"], parseFloat(val));
    }

    this.setState({ wetness: val });
  }

  onChangeSlider(paramName) {
    const delayNode = this.state.delayNode;

    return (ev) => {
      const val = ev.target.value;
      const adress = this.paramName2faustAdressName[paramName];
      delayNode.setParamValue(adress, parseFloat(val));
      this.setState({ [paramName]: val });
    }
  }

  render () {
    const { delayTimeMsec, feedbackGain, wetness, drive, cutoffFreqHz } = this.state;
    return (
      <div>
        <h1>Sampler</h1>
        <button onClick={this.playAudio.bind(this)}>Play Audio</button>

        <h1>Effector</h1>
        <input type="checkbox" onChange={this.onChangeBypass.bind(this)} />Effect Bypass <br />

        <p>Delay Time (msec)</p>
        <input type="range" value={delayTimeMsec} min="100" max="1000" step="1" onChange={this.onChangeSlider("delayTimeMsec").bind(this)} />
        <span>{delayTimeMsec} msec</span>

        <p>Feedback Gain</p>
        <input type="range" value={feedbackGain} min="0" max="1" step="0.01" onChange={this.onChangeSlider("feedbackGain").bind(this)} />
        <span>{feedbackGain}</span>

        <p>Feedback Distortion</p>
        <input type="range" value={drive} min="1" max="20" step="0.1" onChange={this.onChangeSlider("drive").bind(this)} />
        <span>{drive}</span>

        <p>LPF Cutoff Frequency (Hz)</p>
        <input type="range" value={cutoffFreqHz} min="40" max="10000" step="1" onChange={this.onChangeSlider("cutoffFreqHz").bind(this)} />
        <span>{cutoffFreqHz} Hz</span>

        <p>Wetness</p>
        <input type="range" value={wetness} min="0" max="1" step="0.01" onChange={this.onChangeWetness.bind(this)} />
        <span>{wetness * 100.0} %</span>
      </div>
    )
  }
}

render(<DelayEffector />, document.getElementById('app'));
