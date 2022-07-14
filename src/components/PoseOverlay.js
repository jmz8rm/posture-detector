import React, {useState, useEffect, useRef} from 'react';
import ValidNumberInput from './ValidNumberInput.js'

// TODO: pretty pictures and layout for all summary statistics
// TODO: alert system
// TODO: make video image same as pose points displayed and not offset by 1

// set of functions in degrees
function atan(num) { return Math.atan(num)*180/Math.PI; }
function tan(num) { return Math.tan(num/180*Math.PI); }
// function cos(num) { return Math.cos(num/180*Math.PI); }
function sin(num) { return Math.sin(num/180*Math.PI); }

// draw circle on canvas
function drawCircle(context, x, y) {
    context.fillStyle = 'white';
    context.beginPath();
    context.arc(x, y, 4, 0, 360, 0);
    context.fill();
}

// draw text on canvas
function drawText(context, x, y, text) {
    context.font = '10px sans-serif';
    context.fillText(text, x, y);
}

// calculate angle from vertical between two points
// takes in points obj and names of the two points
function calcAngle(points, p1, p2) {
    p1 = points[p1];
    p2 = points[p2];
    if(!p1 || !p2) return null;
    return Math.atan((p1.x - p2.x) / (p2.y - p1.y))*180/Math.PI;
}

// add in new point representing the average of two points
function addAverage(points, p1, p2, newName) {
    p1 = points[p1];
    p2 = points[p2];
    if(!p1 || !p2) return;

    points[newName] = {
        x: (p1.x+p2.x)/2.0,
        y: (p1.y+p2.y)/2.0,
    };
}

// return data URL of current image in video
// function screenshot(video) {
//     const canvas = document.createElement('canvas');
//     const context = canvas.getContext('2d');
//     canvas.width = video.videoWidth;
//     canvas.height = video.videoHeight;

//     // clear canvas and draw image from video
//     context.clearRect(0, 0, canvas.width, canvas.height);
//     context.drawImage(video, 0, 0);

//     return canvas.toDataURL('image/png');
// }

// function imgFromURL(url) {
//     const img = document.createElement('img');
//     img.src = url;
//     return img;
// }

function PoseOverlay(props) {
    const N_RUNAVG = 300; // running average in ms
    const video = props.videoRef.current;

    const canvasRef = useRef();
    const resetTime = useRef(false);
    const camAngle = useRef(0);

    const [frames, setFrames] = useState(0);
    const [prevTime, setPrevTime] = useState(0);
    const [fps, setFPS] = useState(0);
    const [stillImg, setStillImg] = useState('data:null');
    const [angle, setAngle] = useState(0);
    const [avg, setAvg] = useState(0);

    // summary stats
    const [minAngle, setMinAngle] = useState(90);
    const [maxAngle, setMaxAngle] = useState(0);
    const [minAvg, setMinAvg] = useState(90);
    const [maxAvg, setMaxAvg] = useState(0);

    // increment frame and update fps if one second has passed
    function countFrame() {
        if(parseInt(prevTime/1000) !== parseInt(Date.now()/1000)) {
            setFPS(frames);
            setFrames(1);
            setPrevTime(Date.now());
        } else {
            setFrames(frames => frames+1); 
        }
    }

    // delay render with a dummy frame to trigger rerender
    function renderIn(time) {
        setTimeout(() => { countFrame(); }, time);
    }

    // process pose
    function usePose(pose) {
        countFrame(); // updates frame count

        // set canvas properties
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // clear canvas and draw image from video
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(video, 0, 0);

        // see if maxangle image needs to be reset
        if(resetTime.current && resetTime.current <= Date.now()) {
            setMaxAngle(0);
            setMaxAvg(0);
            setMinAngle(90);
            setMinAvg(90);
            setStillImg('data:null');
            resetTime.current = null;
        }

        // if a pose is present
        if(pose[0]) {
            // stores points in dict, key is name of point and value is object 
            let points = {};
            for(const point of pose[0].keypoints) {
                if(point.score > 0.3) {
                    drawCircle(context, point.x, point.y);
                    drawText(context, point.x+5, point.y-5, point.name);
                    points[point.name] = { x: point.x, y: point.y };
                }
            }
            
            // calculates angles
            addAverage(points, "left_ear", "right_ear", "ears");
            addAverage(points, "left_shoulder", "right_shoulder", "shoulders");
            const perceivedAngle = calcAngle(points, "shoulders", "ears");
            const neckAngle = atan(tan(perceivedAngle)*sin(camAngle.current));
            const valid = perceivedAngle !== null;

            // displays sum of angles
            if(valid) {
                setAngle(neckAngle);

                const newAvg = avg - avg/N_RUNAVG + neckAngle/N_RUNAVG;
                setAvg(newAvg);
                
                if(Math.abs(neckAngle) > Math.abs(maxAngle)) setMaxAngle(neckAngle);
                if(Math.abs(neckAngle) < Math.abs(minAngle)) setMinAngle(neckAngle);
                if(Math.abs(neckAngle) > Math.abs(maxAvg)) setMaxAvg(newAvg);
                if(Math.abs(neckAngle) < Math.abs(minAvg)) setMinAvg(newAvg);
            }

            // if angles are imbalanced update maxAngle
            if(valid && Math.abs(neckAngle) > Math.abs(maxAngle)) {
                setMaxAngle(neckAngle);
                setStillImg(canvas.toDataURL('image/png'));
            }

        }
    }

    // renders on every new frame; otherwise, render every 100 ms
    useEffect(() => {
        if(props.model && props.videoRef.current && props.active) {

            props.model.estimatePoses(props.videoRef.current).then(usePose, (reason) => { renderIn(100); });
        } else {
            setTimeout(() => renderIn(10));
        }
    });

    return (
        <div>
            <p hidden={props.active}>Enable video permissions and refresh</p>
            <div className="PoseOverlay" hidden={!props.active}>
                <canvas ref={canvasRef} style={{display:"block"}}/>
                <p>FPS: {fps}</p>
                <p>Angle: {angle.toFixed(2)}&#730;</p>
                <p>Rolling average angle: {avg.toFixed(2)}&#730;</p> 
                <ValidNumberInput setValidNum={(num) => { camAngle.current = num; }} />
                <p>Current camera angle: {camAngle.current}&#730;</p>
                <p>0&#730; is a front camera, 90&#730; is a side camera</p>
                <p>Min angle: {Math.abs(minAngle).toFixed(2)}&#730;</p>
                <p>Max angle: {Math.abs(maxAngle).toFixed(2)}&#730;</p>
                <p>Min rollavg: {Math.abs(minAvg).toFixed(2)}&#730;</p>
                <p>Max rollavg: {Math.abs(maxAvg).toFixed(2)}&#730;</p>
                <button onClick={() => resetTime.current=Date.now()}>Reset stats</button>
                <button onClick={() => resetTime.current=Date.now()+3000}>Reset max angle in 3s</button>
                <br />
                <img src={stillImg} alt=""/>
            </div>
        </div>
    );
}

export default PoseOverlay;