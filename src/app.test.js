import React from "react";
//"waitForElement" causes to pause test for waiting for <div> to appear
import { render, fireEvent, waitForElement } from "@testing-library/react";
import axios from "./axios";

import App from "./app";

//mock axios
jest.mock("axios");

test("app shows nothing at first and then renders a div after axios has finished", async () => {
    axios.get.mockResolvedValue({
        data: {
            id: 1,
            first: "Clemens",
            last: "Clem",
            url: "/profilePic.jpg",
        },
    });

    const { container } = render(<App />);

    await waitForElement(() => container.querySelector("div"));

    //toBe is one method of heeps of methods called "matches", check matches out in the docu
    expect(container.children.length).toBe(1);
});

//tests still to be written...
