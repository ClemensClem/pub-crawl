import React from "react";
import ProfilePic from "./profilePic";
//fireEvent is a method that triggers events
import { render, fireEvent } from "@testing-library/react";

test("renders img with src set to url prop", () => {
    //render here comes from the testing library
    //the function gives us back the DOM that is rendered --> container is the DOM! (everything we did in week2 with the dom we can do with "container")
    const { container } = render(<ProfilePic url="/puppy.jpg" />);

    //we can use JS methods to read out the DOM/container object
    expect(container.querySelector("img").getAttribute("src")).toBe(
        "/puppy.jpg"
    );
});

test("renders img with src set to tp default.jpg when no url prop is present", () => {
    const { container } = render(<ProfilePic />);
    expect(container.querySelector("img").getAttribute("src")).toBe(
        "/default.jpg"
    );
});

test("renders first and last props in alt attribute", () => {
    const { container } = render(<ProfilePic first="Clemens" last="Clem" />);
    expect(container.querySelector("img").getAttribute("alt")).toBe(
        "Clemens Clem"
    );
});

test('we gonna confirm that clicking on image triggers "on-click"-method runs o on click', () => {
    //check how the prop in my function is called and adjust
    //defining a mock function for the on-click function
    //here nothing is passed to the function because we only care about if function runs or not!
    const myMockOnClick = jest.fn();
    //"myMockOnClick"-object contains functions that can be used to inspect what happened
    const { container } = render(<ProfilePic onClick={myMockOnClick} />);
    //click will be done twice
    fireEvent.click(container.querySelector("img"));
    fireEvent.click(container.querySelector("img"));
    expect(myMockOnClick.mock.calls.length).toBe(2);
});

// npm test --> fire test
