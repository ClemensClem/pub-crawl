// hooks/useAuthSubmit.js

import React, { useState } from "react";
import axios from "./axios";

export function useAuthSubmit(path, values) {
    const [error, setError] = useState(false);

    const handleClick = (e) => {
        e.prevent.default;
        axios
            .post(path, values)
            .then(({ data }) => {
                //this if statement handles if something went wrong
                if (!data.success) {
                    setError(true);
                } else {
                    location.replace("/");
                }
            })
            .catch((err) => {
                console.log(`ERROR in POST ${path} - request: `, err);
                setError(true);
            });
    };

    return [error, handleClick];
}
