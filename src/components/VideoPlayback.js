import React, {useState, useEffect, useRef} from 'react';
import * as poseDetection from '@tensorflow-models/pose-detection';
import '@tensorflow/tfjs-backend-webgl';
import Video from './Video.js'
import PoseOverlay from './PoseOverlay.js'

function VideoPlayback() {
    const videoRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [model, setModel] = useState(null);
    
    const hide = !(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);

    // get video stream and MoveNet model
    useEffect(() => {
        navigator.mediaDevices.getUserMedia({video: true}).then((stream) => {setStream(stream);});
        poseDetection.createDetector(poseDetection.SupportedModels.MoveNet).then((model) => {setModel(model); console.log("model made");}, (reason) => {console.log("failed to make model");});
    }, []);

    // check for when stream ends
    useEffect(() => {
        if(stream) stream.addEventListener("inactive", () => {setStream(null);});
    }, [stream]);
    
    return (
        <div>
            <p hidden={!hide}>No video input detected</p>
            <div className="VideoPlayback" hidden={hide}>
                <Video stream={stream} videoRef={videoRef} />
                <PoseOverlay videoRef={videoRef} model={model} active={stream || false} />
            </div>
        </div>
    );
}

export default VideoPlayback;