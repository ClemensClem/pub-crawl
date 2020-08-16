import React, { Component } from "react";
//"./axios" is important because we created the file axios.js to make csurf available outside of a form-context
import axios from "./axios";
//enables React Router
import { Link } from "react-router-dom";

class Login extends Component {
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
        if (this.state.email && this.state.password) {
            this.setState({ formNotComplete: false });
        } else {
            this.setState({ formNotComplete: true });
        }
    }

    submit(e) {
        e.preventDefault();
        axios
            .post("/login", this.state)
            .then(({ data }) => {
                console.log('POST "/login" answer: ', data);

                if (data.success) {
                    //Log the user into our app
                    //Maybe "Location.replace"
                    location.replace("/");
                } else {
                    this.setState({
                        loginError: true,
                    });
                }
            })
            .catch((err) => console.log('ERROR in POST "/login":, ', err));
    }

    render() {
        return (
            <React.Fragment>
                <h1>Login</h1>
                {this.state.loginError && (
                    <div>
                        <p>
                            Something went wrong during login, please try
                            again...
                        </p>
                    </div>
                )}
                <form className="loginForm">
                    <input
                        className=""
                        name="email"
                        placeholder="email"
                        type="email"
                        onChange={(e) => this.handleChange(e)}
                        required
                    />
                    <input
                        className=""
                        name="password"
                        placeholder="password"
                        type="password"
                        onChange={(e) => this.handleChange(e)}
                        required
                    />
                    <button
                        disabled={this.state.formNotComplete}
                        onClick={(e) => this.submit(e)}
                    >
                        Login
                    </button>
                </form>
                <Link to="/">
                    <button>Register</button>
                </Link>
                <p>
                    Here you can{" "}
                    {<Link to="/password/reset">reset your password</Link>}
                </p>
            </React.Fragment>
        );
    }
}

export default Login;
