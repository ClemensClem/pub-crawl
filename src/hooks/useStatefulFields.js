//hooks/useStatefulFields.js

import React, { useState } from "react";

//every hook needs to start with "use"
export function useStatefulFields() {
    const { values, setValues } = useState({});

    const handleChange = (e) => {
        setValues({
            ...values,
            [e.targe.name]: e.target.value,
        });
    };

    return [values, handleChange];
}
