import React, { Component } from "react";
//"./axios" is important because we created the file axios.js to make csurf available outside of a form-context
import axios from "./axios";
//enables React Router
import { Link } from "react-router-dom";

class Registration extends Component {
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
            }
            //Console-log with a callback
            // () => console.log("this.state: ", this.state);
        );
        if (
            this.state.first &&
            this.state.last &&
            this.state.email &&
            this.state.password
        ) {
            this.setState({ formNotComplete: false });
        } else {
            this.setState({ formNotComplete: true });
        }
    }

    submit(e) {
        e.preventDefault();
        axios
            .post("/register", this.state)
            .then(({ data }) => {
                console.log("POST '/register' data back from server: ", data);
                if (data.success) {
                    //Log the user into our app
                    location.replace("/");
                } else {
                    this.setState({
                        registrationError: true,
                    });
                }
            })
            .catch((err) => console.log('ERROR in "/register": ', err));
    }

    render() {
        return (
            <React.Fragment>
                <h1>Join us</h1>
                {this.state.registrationError && (
                    <div>
                        <p className="error">
                            Something went wrong during registration, please try
                            again...
                        </p>
                    </div>
                )}
                <form className="registrationForm">
                    <input
                        className=""
                        name="first"
                        placeholder="First Name"
                        type="text"
                        onChange={(e) => this.handleChange(e)}
                        required
                    />
                    <input
                        className=""
                        name="last"
                        placeholder="Last Name"
                        type="text"
                        onChange={(e) => this.handleChange(e)}
                        required
                    />
                    <input
                        className=""
                        name="email"
                        placeholder="Email"
                        type="email"
                        onChange={(e) => this.handleChange(e)}
                        required
                    />
                    <input
                        className=""
                        name="password"
                        placeholder="Password"
                        type="password"
                        onChange={(e) => this.handleChange(e)}
                        required
                    />
                    <button
                        disabled={this.state.formNotComplete}
                        onClick={(e) => this.submit(e)}
                    >
                        Register
                    </button>
                </form>
                <Link to="/login">
                    <button>Login</button>
                </Link>
            </React.Fragment>
        );
    }
}

export default Registration;
