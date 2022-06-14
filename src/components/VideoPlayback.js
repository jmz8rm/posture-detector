import React, {useState, useEffect, useRef} from 'react';
import * as poseDetection from '@tensorflow-models/pose-detection';
import '@tensorflow/tfjs-backend-webgl';
import Video from './Video.js'
import PoseOverlay from './PoseOverlay.js'

function VideoPlayback() {
    const videoRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [model, setModel] = useState(null);
    
    // if(!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) return (
    //     <div className="VideoPlayback">
    //         "No video input detected."
    //     </div>
    // );

    // get video stream and MoveNet model
    useEffect(() => {
        navigator.mediaDevices.getUserMedia({video: true}).then((stream) => {setStream(stream);});
        poseDetection.createDetector(poseDetection.SupportedModels.MoveNet).then((model) => {setModel(model);}, (reason) => {console.log("model failed");});
    }, []);

    // check for when stream ends
    useEffect(() => {
        if(stream) stream.addEventListener("inactive", () => {setStream(null);});
    }, [stream]);

    return (
        <div className="VideoPlayback">
            <Video stream={stream} videoRef={videoRef} />
            <PoseOverlay videoRef={videoRef} model={model} active={stream || false} />
        </div>
    );
}

export default VideoPlayback;