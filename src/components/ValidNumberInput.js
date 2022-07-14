import React, {useState, useEffect} from 'react';

function ValidNumberInput(props) {
    const [num, setNum] = useState("");

    useEffect(() => {
        if(num === "") props.setValidNum(0);
        else if(!isNaN(num)) {
            const temp = parseFloat(num);
            if(0 <= temp && temp <= 90) props.setValidNum(parseFloat(num));
        }
    }, [num, props]);

    return (
        <div className="ValidNumberInput">
            <label>
                Camera angle: 
                <input type='text' value={num} onChange={(e) => {setNum(e.target.value);}} />
            </label>
        </div>
    );
}

export default ValidNumberInput;