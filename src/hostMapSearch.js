import React from "react";
import { useDispatch, useSelector } from "react-redux";

import usePlacesAutocomplete, {
    getGeocode,
    getLatLng,
} from "use-places-autocomplete";
import {
    Combobox,
    ComboboxInput,
    ComboboxPopover,
    ComboboxList,
    ComboboxOption,
} from "@reach/combobox";
// import "@reach/combobox/styles.css";

import { addMarkerPosition } from "./actions";

export default function Search({ panTo }) {
    const dispatch = useDispatch();

    //storing marker position from Redux store
    const markerPosition = useSelector(
        (state) => state.markerPosition && state.markerPosition
    );

    const {
        ready,
        value,
        suggestions: { status, data },
        setValue,
        clearSuggestions,
    } = usePlacesAutocomplete({
        requestOptions: {
            location: {
                lat: () => markerPosition.lat,
                lng: () => markerPosition.lng,
            },
            radius: 2 * 1000,
        },
    });

    return (
        <div className="searchBox">
            <Combobox
                onSelect={async (address) => {
                    //this comes from the autocomplete module --> it update sthe state to the selected value and prevents another request to the Google Autocomplete API
                    setValue(address, false);
                    //clears the suggestions in the box
                    clearSuggestions();
                    try {
                        const results = await getGeocode({ address });
                        const { lat, lng } = await getLatLng(results[0]);
                        const markerPosition = {
                            lat,
                            lng,
                        };
                        dispatch(addMarkerPosition(markerPosition));
                        panTo({ lat, lng });
                    } catch (err) {
                        console.log(
                            'ERROR in hostMap.js --> "Search"-function <Combobox>: ',
                            err
                        );
                    }
                }}
            >
                <ComboboxInput
                    value={value}
                    onChange={(e) => {
                        setValue(e.target.value);
                    }}
                    disabled={!ready}
                    placeholder="What are you looking for?"
                />

                <ComboboxPopover>
                    <ComboboxList>
                        {status === "OK" &&
                            data.map(({ id, description }) => (
                                <ComboboxOption key={id} value={description} />
                            ))}
                    </ComboboxList>
                </ComboboxPopover>
            </Combobox>
        </div>
    );
}
