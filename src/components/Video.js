function Video(props) {
    if(props.stream) props.videoRef.current.srcObject = props.stream;

    return (
        <div className="Video" hidden={true}>
            <video ref={props.videoRef} autoPlay={true} playsInline={true}/>
        </div>
    );
}

export default Video;