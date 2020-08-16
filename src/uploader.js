import React, { Component } from "react";
import axios from "./axios";

export default class Uploader extends Component {
    constructor(props) {
        super();
        this.state = {};
        //props from parent are stored in "this.props"
    }

    //as soon as picture is selected this function runs and uploads the picture
    async handleChange(e) {
        let formData = new FormData();
        formData.append("file", e.target.files[0]);
        try {
            //don't wonder on the server side the req.body will be empty if console.logged
            const { data } = await axios.post(
                "/upload-profile-picture",
                formData
            );
            console.log('data from "/upload-profile-picture": ', data);
            this.props.toggleModal();
            this.props.updateProfilePic(data.url);
        } catch (err) {
            console.log('ERROR in POST "/upload-profile-picture": ', err);
            this.setState({ uploadProfilePicError: true });
        }
    }

    render() {
        return (
            <div className="profilePicUploader">
                <div className="profilePicUploaderContent">
                    <div className="closingUploader">
                        <img
                            src="./resources/media/close.png"
                            onClick={this.props.toggleModal}
                        />
                    </div>
                    <h3>Upload a profile picture</h3>
                    {this.state.success && (
                        <p>
                            Something went wrong during upload, please try
                            again...
                        </p>
                    )}
                    <form className="profilePicUploaderForm">
                        <input
                            id="uploadFile"
                            type="file"
                            name="fileUpload"
                            accept="image/*"
                            placeholder="Add a picture"
                            onChange={(e) => this.handleChange(e)}
                            required
                        />
                        <label for="uploadFile">Choose a file</label>
                    </form>
                </div>
            </div>
        );
    }
}
