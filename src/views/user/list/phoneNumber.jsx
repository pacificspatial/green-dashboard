import React, {useCallback, useEffect, useMemo, useRef} from "react";
import PropTypes from "prop-types";
import {phoneNumberToITN, phoneNumberToJP} from "@_manager/util.jsx";

const PhoneNumberEditor = ({ value, onValueChange, eventKey }) => {
    const refInput = useRef(null);

    const phoneToJp = useMemo(() => phoneNumberToJP, [])
    const phoneToItn = useMemo(() => phoneNumberToITN, [])

    const updateValue = useCallback((displayValue) => {
        const storageValue = phoneToItn(displayValue);
        onValueChange(storageValue);
    }, [onValueChange])

    useEffect(() => {
        let startValue;

        if (eventKey === "Backspace") {
            startValue = "";
        } else if (eventKey && eventKey.length === 1) {
            startValue = eventKey;
        } else {
            // 既存の値を表示形式に変換
            startValue = phoneToJp(value);
        }

        if (startValue == null) {
            startValue = "";
        }

        // 初期値を設定（表示形式のまま）
        if (refInput.current) {
            refInput.current.value = startValue;
        }

        // Backdrop要素が存在しない場合のみフォーカスを当てる
        const hasBackdrop = document.querySelector('.MuiBackdrop-root[aria-hidden="true"]');
        if (!hasBackdrop && refInput.current) {
            refInput.current.focus();
            refInput.current.select();
        }
    }, []);

    const handleChange = useCallback((event) => {
        const inputValue = event.target.value;
        updateValue(inputValue);
    }, [updateValue])

    return (
        <input
            ref={refInput}
            defaultValue={phoneNumberToJP(value)}
            onChange={handleChange}
            style={{
                width: '100%',
                height: '100%',
                border: 'none',
                outline: 'none',
                padding: '0 8px'
            }}
        />
    );
};
PhoneNumberEditor.propTypes = {
    value: PropTypes.any,
    onValueChange: PropTypes.func,
    eventKey: PropTypes.any,
}

export default PhoneNumberEditor;