import React, { Component } from "react";
import axios from "./axios";

export default class BioEditor extends Component {
    //props: bio, updateBio
    constructor(props) {
        super(props);
        this.state = {
            updatingBio: false,
        };
    }

    handleChange(e) {
        //writes data from text area in state variable this.state.bio
        this.setState(
            {
                bio: e.target.value,
            },
            () => console.log("this.state: ", this.state)
        );
    }

    async editBio() {
        //creating an object for the axios POST request
        let bioData = {};
        bioData.bio = this.state.bio;
        //making the call with axios
        try {
            let { data } = await axios.post("/update-bio", bioData);
            //if post-call was successfull
            if (data) {
                this.props.updateBio(this.state.bio);
                this.setState({ updatingBio: false });
            }
        } catch (err) {
            console.log('ERROR in POST "/update-bio": ', err);
            this.setState({ editBioError: true });
        }
    }

    getCurrentDisplay() {
        //If user in process of editing render the "updatingBio" screen with text are
        if (this.state.updatingBio) {
            return (
                <div className="bioEditor">
                    <h3>What is your story?</h3>
                    {this.state.editBioError && (
                        <p className="error">
                            Something went wrong, please try again...
                        </p>
                    )}
                    <textarea
                        id="textField"
                        name="textField"
                        rows="10"
                        cols="60"
                        onChange={(e) => this.handleChange(e)}
                        //if there is no bio existing then an empty string is rendered
                        defaultValue={this.props.bio ? this.props.bio : ""}
                    ></textarea>
                    <button onClick={() => this.editBio()}>Save</button>
                </div>
            );
            //If there is bio data existing (passed from the parent app.js) render the "Edit" Button
        } else if (this.props.bio) {
            return (
                <div className="bioEditor">
                    <h3>About me</h3>
                    <p>{this.props.bio}</p>
                    <button
                        onClick={() =>
                            this.setState({
                                updatingBio: true,
                            })
                        }
                    >
                        Edit
                    </button>
                </div>
            );
            //If there is no bio data existing (passed from the parent app.js) render the "Add" Button
        } else {
            return (
                <div className="bioEditor">
                    <h3>Tell us something about you!</h3>
                    <button
                        onClick={() =>
                            this.setState({
                                updatingBio: true,
                            })
                        }
                    >
                        Add
                    </button>
                </div>
            );
        }
    }

    render() {
        return this.getCurrentDisplay();
    }
}
