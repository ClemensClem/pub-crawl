import React, { Component } from "react";
//"./axios" is important because we created the file axios.js to make csurf available outside of a form-context
import axios from "./axios";
//enables React Router
import { Link } from "react-router-dom";

class ResetPassword extends Component {
    constructor(props) {
        super(props);
        this.state = {
            formNotComplete: true,
        };
    }

    async handleChange(e) {
        await this.setState(
            {
                [e.target.name]: e.target.value,
            },
            () => console.log("this.state: ", this.state)
        );
        //check on empty fields
        if (this.state.processStep === "resetCodeSent") {
            if (this.state.resetCode && this.state.password) {
                this.setState({ formNotComplete: false });
            } else {
                this.setState({ formNotComplete: true });
            }
        } else {
            if (this.state.email) {
                this.setState({ formNotComplete: false });
            } else {
                this.setState({ formNotComplete: true });
            }
        }
    }

    submitEmail(e) {
        e.preventDefault();
        axios
            .post("/password/reset/start", this.state)
            .then(({ data }) => {
                console.log(
                    'Response from POST "/password/reset/start": ',
                    data
                );
                if (data.success) {
                    this.setState({
                        resetPasswordError: false,
                        processStep: "resetCodeSent",
                    });
                } else {
                    this.setState({
                        resetPasswordError: true,
                    });
                }
            })
            .catch((err) => {
                console.log('ERROR in "/password/reset/start": ', err);
                this.setState({
                    resetPasswordError: true,
                });
            });
    }

    async toggleFormValidation() {
        await this.setState({ formNotComplete: true });
    }

    submitNewPassword(e) {
        e.preventDefault();
        axios
            .post("/password/reset/verify", {
                email: this.state.email,
                resetCode: this.state.resetCode,
                password: this.state.password,
            })
            .then(({ data }) => {
                console.log(
                    'Response from POST "/password/reset/verify": ',
                    data
                );
                if (data.success) {
                    this.setState({
                        resetPasswordError: false,
                        resetCode: "",
                        password: "",
                        processStep: "passwordChanged",
                    });
                } else {
                    this.setState({
                        resetPasswordError: true,
                    });
                }
            })
            .catch((err) => {
                console.log('ERROR in "/password/reset/verify": ', err);
                this.setState({
                    resetPasswordError: true,
                });
            });
    }

    getCurrentDisplay() {
        if (this.state.processStep === "resetCodeSent") {
            return (
                <React.Fragment>
                    <h4>
                        Please verify your new password with the most recent
                        reset-code we just sent you per mail:
                    </h4>
                    {this.state.resetPasswordError && (
                        <div>
                            <p>
                                Something went wrong during reset, please try
                                again...
                            </p>
                        </div>
                    )}
                    <form className="passwordVarificationForm">
                        <input
                            className=""
                            name="resetCode"
                            key="resetCode"
                            placeholder="Reset-Code"
                            type="password"
                            onChange={(e) => this.handleChange(e)}
                            required
                        />
                        <input
                            className=""
                            name="password"
                            key="password"
                            placeholder="New Password"
                            type="password"
                            onChange={(e) => this.handleChange(e)}
                            required
                        />
                        <button
                            disabled={this.state.formNotComplete}
                            onClick={(e) => {
                                this.toggleFormValidation();
                                this.submitNewPassword(e);
                            }}
                        >
                            Submit
                        </button>
                    </form>
                </React.Fragment>
            );
        } else if (this.state.processStep === "passwordChanged") {
            return (
                <React.Fragment>
                    <h3>Password changed successfully, please login</h3>
                    <Link to="/login">
                        <button>Login</button>
                    </Link>
                </React.Fragment>
            );
        } else {
            return (
                <React.Fragment>
                    <h3>Find your account</h3>
                    {this.state.resetPasswordError && (
                        <div>
                            <p>
                                Something went wrong during reset, please try
                                again...
                            </p>
                        </div>
                    )}
                    <form className="resetPasswordForm">
                        <input
                            className=""
                            name="email"
                            key="email"
                            placeholder="email"
                            type="email"
                            onChange={(e) => this.handleChange(e)}
                            required
                        />
                        <button
                            disabled={this.state.formNotComplete}
                            onClick={(e) => this.submitEmail(e)}
                        >
                            Submit
                        </button>
                    </form>
                </React.Fragment>
            );
        }
    }

    render() {
        return this.getCurrentDisplay();
    }
}

export default ResetPassword;
