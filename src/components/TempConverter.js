import React, {useState} from 'react';
import TextInput from './TextInput';

function TempConverter() {
    const [temp, setTemp] = useState(0);
    const [units, setUnits] = useState('c');

    let ctemp, ftemp;
    if(units === 'c') {
        ctemp = temp;
        ftemp = (temp*9/5)+32;
    } else {
        ftemp = temp;
        ctemp = (temp-32)*5/9;
    }

    function getHandleChange(units) {
        return (event) => {
            setUnits(units);
            setTemp(event.target.value === '' ? '0' : parseFloat(event.target.value));
        };
    }

    return (
        <div className="TempConverter">
            Temperature converter
            <TextInput value={ctemp} handleChange={getHandleChange('c')}>
                Celsius temperature: 
            </TextInput>
            <TextInput value={ftemp} handleChange={getHandleChange('f')}>
                Farenheit temperature: 
            </TextInput>
        </div>
    );
}

export default TempConverter;