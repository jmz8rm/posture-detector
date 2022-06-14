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
    const canvasRef = useRef(null);
    const [temp, setTemp] = useState(0);
    const [pose, setPose] = useState(null);

    let interval;

    useEffect(() => {
        interval = setInterval(() => setTemp(temp => temp+1), 33);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if(props.model && props.videoRef.current) {
            props.model.estimatePoses(props.videoRef.current).then((pose) => {setPose(pose);}, (reason) => {console.log("pose error");});
            console.log(pose); 
        }
    });

    if(props.active) {
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        const video = props.videoRef.current;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);

        if(pose) {
            for(const point of pose[0].keypoints) {
                if(point.score > 0.4) {
                    drawCircle(context, point.x, point.y);
                    drawText(context, point.x+5, point.y-5, point.name);
                }
            }
        }
    }

    return (
        <canvas ref={canvasRef} style={{display:"block"}}/>
    );
}

export default PoseOverlay;