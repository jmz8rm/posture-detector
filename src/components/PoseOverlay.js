import React, {useState, useEffect, useRef} from 'react';

function drawCircle(context, x, y) {
    context.fillStyle = 'white';
    context.beginPath();
    context.arc(x, y, 4, 0, 360, 0);
    context.fill();
}

function drawText(context, x, y, text) {
    context.font = '10px sans-serif';
    context.fillText(text, x, y);
}

function PoseOverlay(props) {
    const canvasRef = useRef();

    const [frames, setFrames] = useState(0);
    const [pose, setPose] = useState(null);
    const [prevTime, setPrevTime] = useState(0);
    const [fps, setFPS] = useState(0);

    function updateFPS() {
        if(parseInt(prevTime/1000) !== parseInt(Date.now()/1000)) {
            setFPS(frames);
            setFrames(1);
            setPrevTime(Date.now());
        } else {
            setFrames(frames => frames+1); 
        }
    }

    function renderIn(time) {
        setTimeout(() => { 
            updateFPS();
        }, time);
    }

    useEffect(() => {
        if(props.model && props.videoRef.current) {
            props.model.estimatePoses(props.videoRef.current).then((pose) => { setPose(pose); updateFPS(); }, (reason) => { renderIn(100);});
        } else {
            setTimeout(() => renderIn(100));
        }
    });

    if(props.active) {
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        const video = props.videoRef.current;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(video, 0, 0);

        let activePoints = {};

        if(pose && pose[0]) {
            for(const point of pose[0].keypoints) {
                if(point.score > 0.4) {
                    drawCircle(context, point.x, point.y);
                    drawText(context, point.x+5, point.y-5, point.name);
                    activePoints[point.name] = { x: point.x, y: point.y };
                }
            }
        }
    }

    return (
        <div className="PoseOverlay">
            <canvas ref={canvasRef} style={{display:"block"}}/>
            FPS: {fps}
        </div>
    );
}

export default PoseOverlay;