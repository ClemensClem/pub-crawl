import React from "react";
import { render, fireEvent, waitForElement } from "@testing-library/react";
import axios from "./axios";
jest.mock("axios");

import BioEditor from "./bioEditor";

test('(1) When no bio is passed to it, an "Add" button is rendered.', () => {
    const { container } = render(<BioEditor bio="abc" />);

    expect(container.querySelector("button").innerText).toBe("Add");
});

test('(2) When a bio is passed to it, an "Edit" button is rendered.', () => {
    const { container } = render(<BioEditor bio="This is a test bio..." />);

    expect(container.querySelector("button").innerText).toBe("Edit");
});

test('(3.1) Clicking the "Add" button causes a textarea and a "Save" button to be rendered.', () => {
    const myMockOnClick = jest.fn();

    const { container } = render(<BioEditor bio="" onClick={myMockOnClick} />);

    fireEvent.click(container.querySelector("button"));

    expect(container.querySelector("textarea")).toBeTruthy();
    expect(container.querySelector("button").innerText).toBe("Save");
});

test('(3.2) Clicking the Edit" button causes a textarea and a "Save" button to be rendered.', () => {
    const myMockOnClick = jest.fn();

    const { container } = render(
        <BioEditor bio="This is a test bio..." onClick={myMockOnClick} />
    );

    fireEvent.click(container.querySelector("button"));

    expect(container.querySelector("textarea")).toBeTruthy();
    expect(container.querySelector("button").innerText).toBe("Save");
});

test('(4) Clicking the "Save" button causes an ajax request.', async () => {
    axios.post.mockResolvedValue({
        data: {
            bio: "This is a test bio...",
        },
    });

    const myMockOnClick = jest.fn();

    const { container } = render(
        <BioEditor updatingBio={true} onClick={myMockOnClick} />
    );

    fireEvent.click(container.querySelector("button"));
    expect(axios.post).toHaveBeenCalled();
});

//tests still to be written...
//not all tests are working properly
