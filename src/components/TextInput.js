function TextInput(props) {
    return (
        <div className="TextInput">
            {props.children}
            <input type="text" value={props.value} onChange={props.handleChange} />
        </div>
    );
}

export default TextInput;