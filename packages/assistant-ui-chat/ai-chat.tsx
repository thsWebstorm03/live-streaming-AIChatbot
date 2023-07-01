// 引入组件
import '@chatui/core/dist/index.css';
import { useState, useEffect } from 'react';
import Chat, { Bubble, useMessages, ChatProps, toast } from '@chatui/core';
import { postMessage, postMessagePrivate } from './services';
import { PromptModal } from './prompt';
import {
  AIChatContext,
  AIChatContextType,
  defaultAIChatContext,
  Prompt,
  storageSetSetting,
} from './hooks';
import { SettingModal } from './setting';
import DID_API from '../../public/api.json' assert { type: 'json' };

let mmssgg = 'Hello';

export function AIChat() {
  const { messages, appendMsg, setTyping } = useMessages([]);
  const [context, setContext] = useState(defaultAIChatContext);
  const [lastestMessageId, setLastestMessageId] = useState<string>();
  const [promptModalOpen, setPromptModalOpen] = useState(false);
  const [settingModalOpen, setSettingModalOpen] = useState(!Boolean(context.setting.apiKey));



  const setPrompt = (selectedPrompt: Prompt) =>
    setContext({
      ...context,
      prompt: selectedPrompt,
    });

  const setSetting = (setting: Partial<AIChatContextType['setting']>) => {
    const nextSetting = {
      ...context.setting,
      ...setting,
    };

    storageSetSetting(nextSetting);
    setContext({
      ...context,
      setting: nextSetting,
    });
  };


  useEffect(() => {
    if (document) {

    }
    if (DID_API.key == '🤫') alert('Please put your api key inside ./api.json and restart..');

    const RTCPeerConnection = (
      window.RTCPeerConnection ||
      window.webkitRTCPeerConnection ||
      window.mozRTCPeerConnection
    ).bind(window);

    let peerConnection;
    let streamId;
    let sessionId;
    let sessionClientAnswer;

    let statsIntervalId;
    let videoIsPlaying;
    let lastBytesReceived;

    const talkVideo = document.getElementById('talk-video') as HTMLVideoElement;
    talkVideo.setAttribute('playsinline', '');
    talkVideo.setAttribute('poster', 'https://i.ibb.co/1fbLSRW/image.jpg');
    const peerStatusLabel = document.getElementById('peer-status-label');
    const iceStatusLabel = document.getElementById('ice-status-label');
    const iceGatheringStatusLabel = document.getElementById('ice-gathering-status-label');
    const signalingStatusLabel = document.getElementById('signaling-status-label');
    const streamingStatusLabel = document.getElementById('streaming-status-label');

    const connectButton = document.getElementById('connect-button');
    connectButton.onclick = async () => {
      if (peerConnection && peerConnection.connectionState === 'connected') {
        return;
      }

      stopAllStreams();
      closePC();

      const sessionResponse = await fetchWithRetries(`${DID_API.url}/talks/streams`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${DID_API.key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source_url: 'https://i.ibb.co/1fbLSRW/image.jpg',
        }),
      });

      const { id: newStreamId, offer, ice_servers: iceServers, session_id: newSessionId } = await sessionResponse.json();
      streamId = newStreamId;
      sessionId = newSessionId;

      try {
        sessionClientAnswer = await createPeerConnection(offer, iceServers);
      } catch (e) {
        console.log('error during streaming setup', e);
        stopAllStreams();
        closePC();
        return;
      }

      const sdpResponse = await fetch(`${DID_API.url}/talks/streams/${streamId}/sdp`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${DID_API.key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answer: sessionClientAnswer,
          session_id: sessionId,
        }),
      });
    };

    async function tryToTalk(msg: string) {
      console.log(mmssgg, 'mmssgg');
      if (peerConnection?.signalingState === 'stable' || peerConnection?.iceConnectionState === 'connected') {
        const talkResponse = await fetchWithRetries(`${DID_API.url}/talks/streams/${streamId}`, {
          method: 'POST',
          headers: {
            Authorization: `Basic ${DID_API.key}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            script: {
              type: 'text',
              input: msg,
              audio_url: 'https://storage.googleapis.com/eleven-public-prod/SHKgfXt9DkZYGwKLWe68UNnhWB52/voices/HWREwiOXcc7qr0ilCqsg/efad0461-7e8e-4764-bba9-42c2ed034dff.mp3',

            },
            driver_url: 'bank://lively/',
            config: {
              stitch: true,
            },
            session_id: sessionId,
          }),
        });
      }
    }

    const talkButton = document.getElementById('talk-button');
    talkButton.onclick = () => {
      // connectionState not supported in firefox
      const msg = messages[1]?.content;
      console.log(mmssgg, 'talkbutton')
      tryToTalk(mmssgg)
    };

    const destroyButton = document.getElementById('destroy-button');
    destroyButton.onclick = async () => {
      await fetch(`${DID_API.url}/talks/streams/${streamId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Basic ${DID_API.key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ session_id: sessionId }),
      });

      stopAllStreams();
      closePC();
    };

    function onIceGatheringStateChange() {
      iceGatheringStatusLabel.innerText = peerConnection.iceGatheringState;
      iceGatheringStatusLabel.className = 'iceGatheringState-' + peerConnection.iceGatheringState;
    }
    function onIceCandidate(event) {
      console.log('onIceCandidate', event);
      if (event.candidate) {
        const { candidate, sdpMid, sdpMLineIndex } = event.candidate;

        fetch(`${DID_API.url}/talks/streams/${streamId}/ice`, {
          method: 'POST',
          headers: {
            Authorization: `Basic ${DID_API.key}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            candidate,
            sdpMid,
            sdpMLineIndex,
            session_id: sessionId,
          }),
        });
      }
    }
    function onIceConnectionStateChange() {
      iceStatusLabel.innerText = peerConnection.iceConnectionState;
      iceStatusLabel.className = 'iceConnectionState-' + peerConnection.iceConnectionState;
      if (peerConnection.iceConnectionState === 'failed' || peerConnection.iceConnectionState === 'closed') {
        stopAllStreams();
        closePC();
      }
    }
    function onConnectionStateChange() {
      // not supported in firefox
      peerStatusLabel.innerText = peerConnection.connectionState;
      peerStatusLabel.className = 'peerConnectionState-' + peerConnection.connectionState;
    }
    function onSignalingStateChange() {
      signalingStatusLabel.innerText = peerConnection.signalingState;
      signalingStatusLabel.className = 'signalingState-' + peerConnection.signalingState;
    }

    function onVideoStatusChange(videoIsPlaying, stream) {
      let status;
      if (videoIsPlaying) {
        status = 'streaming';
        const remoteStream = stream;
        setVideoElement(remoteStream);
      } else {
        status = 'empty';
        playIdleVideo();
      }
      streamingStatusLabel.innerText = status;
      streamingStatusLabel.className = 'streamingState-' + status;
    }

    function onTrack(event) {
      /**
       * The following code is designed to provide information about wether currently there is data
       * that's being streamed - It does so by periodically looking for changes in total stream data size
       *
       * This information in our case is used in order to show idle video while no talk is streaming.
       */

      if (!event.track) return;

      statsIntervalId = setInterval(async () => {
        const stats = await peerConnection.getStats(event.track);
        stats.forEach((report) => {
          if (report.type === 'inbound-rtp' && report.mediaType === 'video') {
            const videoStatusChanged = videoIsPlaying !== report.bytesReceived > lastBytesReceived;

            if (videoStatusChanged) {
              videoIsPlaying = report.bytesReceived > lastBytesReceived;
              onVideoStatusChange(videoIsPlaying, event.streams[0]);
            }
            lastBytesReceived = report.bytesReceived;
          }
        });
      }, 500);
    }

    async function createPeerConnection(offer, iceServers) {
      if (!peerConnection) {
        peerConnection = new RTCPeerConnection({ iceServers });
        peerConnection.addEventListener('icegatheringstatechange', onIceGatheringStateChange, true);
        peerConnection.addEventListener('icecandidate', onIceCandidate, true);
        peerConnection.addEventListener('iceconnectionstatechange', onIceConnectionStateChange, true);
        peerConnection.addEventListener('connectionstatechange', onConnectionStateChange, true);
        peerConnection.addEventListener('signalingstatechange', onSignalingStateChange, true);
        peerConnection.addEventListener('track', onTrack, true);
      }

      await peerConnection.setRemoteDescription(offer);
      console.log('set remote sdp OK');

      const sessionClientAnswer = await peerConnection.createAnswer();
      console.log('create local sdp OK');

      await peerConnection.setLocalDescription(sessionClientAnswer);
      console.log('set local sdp OK');

      return sessionClientAnswer;
    }

    function setVideoElement(stream) {
      if (!stream) return;
      talkVideo.srcObject = stream;
      talkVideo.loop = false;

      // safari hotfix
      if (talkVideo.paused) {
        talkVideo
          .play()
          .then((_) => { })
          .catch((e) => { });
      }
    }

    function playIdleVideo() {
      talkVideo.srcObject = undefined;
      // talkVideo.src = 'or_idle.mp4';
      talkVideo.loop = true;
    }

    function stopAllStreams() {
      if (talkVideo.srcObject) {
        console.log('stopping video streams');
        const mediaStream = talkVideo.srcObject as MediaStream; // Explicitly cast srcObject to MediaStream
        mediaStream.getTracks().forEach((track) => track.stop());
        // talkVideo.srcObject.getTracks().forEach((track) => track.stop());
        talkVideo.srcObject = null;
      }
    }

    function closePC(pc = peerConnection) {
      if (!pc) return;
      console.log('stopping peer connection');
      pc.close();
      pc.removeEventListener('icegatheringstatechange', onIceGatheringStateChange, true);
      pc.removeEventListener('icecandidate', onIceCandidate, true);
      pc.removeEventListener('iceconnectionstatechange', onIceConnectionStateChange, true);
      pc.removeEventListener('connectionstatechange', onConnectionStateChange, true);
      pc.removeEventListener('signalingstatechange', onSignalingStateChange, true);
      pc.removeEventListener('track', onTrack, true);
      clearInterval(statsIntervalId);
      iceGatheringStatusLabel.innerText = '';
      signalingStatusLabel.innerText = '';
      iceStatusLabel.innerText = '';
      peerStatusLabel.innerText = '';
      console.log('stopped peer connection');
      if (pc === peerConnection) {
        peerConnection = null;
      }
    }

    const maxRetryCount = 3;
    const maxDelaySec = 4;

    async function fetchWithRetries(url, options, retries = 1) {
      try {
        return await fetch(url, options);
      } catch (err) {
        if (retries <= maxRetryCount) {
          const delay = Math.min(Math.pow(2, retries) / 4 + Math.random(), maxDelaySec) * 1000;

          await new Promise((resolve) => setTimeout(resolve, delay));

          console.log(`Request failed, retrying ${retries}/${maxRetryCount}. Error ${err}`);
          return fetchWithRetries(url, options, retries + 1);
        } else {
          throw new Error(`Max retries exceeded. error: ${err}`);
        }
      }
    }

  }, [])

  const handleSend: ChatProps['onSend'] = (type: string, val: string) => {
    const apiKey = context.setting.apiKey;

    if (type === 'text' && val.trim()) {
      appendMsg({
        type: 'text',
        content: { text: val },
        position: 'right',
      });

      setTyping(true);

      postMessagePrivate(apiKey, val, {
        systemMessage: context.prompt.prompt,
        parentMessageId: lastestMessageId,
      }).then(res => {
        setLastestMessageId(res.id);
        mmssgg = res.text;

        appendMsg({
          type: 'text',
          content: { text: res.text },
        });

        const talkButton = document.getElementById('talk-button');
        talkButton.click()
      });
    }
  };

  const renderMessageContent: ChatProps['renderMessageContent'] = msg => {
    const { content } = msg;
    // tryToTalk(content.text)

    return <Bubble content={content.text} />;
  };

  return (
    <AIChatContext.Provider value={context}>
      <PromptModal
        active={promptModalOpen}
        onClose={() => setPromptModalOpen(false)}
        onChangePrompt={setPrompt}
      />
      <SettingModal
        active={settingModalOpen}
        onClose={() => setSettingModalOpen(false)}
        onConfirm={setSetting}
      />
      <div id="content">
        <div id="video-wrapper">
          <div>
            <video id="talk-video" width="300" height="300" autoPlay={true} poster='https://i.ibb.co/1fbLSRW/image.jpg'></video>
          </div>
        </div>
        <br />

        <div id="buttons">
          <button id="connect-button" type="button">Connect</button>
          <button id="talk-button" type="button">Start</button>
          <button id="destroy-button" type="button">Destroy</button>
        </div>

        <div id="status">
          ICE gathering status: <label id="ice-gathering-status-label"></label><br />
          ICE status: <label id="ice-status-label"></label><br />
          Peer connection status: <label id="peer-status-label"></label><br />
          Signaling status: <label id="signaling-status-label"></label><br />
          Streaming status: <label id="streaming-status-label"></label><br />
        </div>
      </div>
      <div style={{ height: "calc( 100vh - 426px )", textAlign: "left" }}>

        <Chat
          messages={messages}
          renderMessageContent={renderMessageContent}
          onSend={handleSend}
          placeholder='Type here...'
          locale='en'

        />
      </div>
    </AIChatContext.Provider>
  );
}

