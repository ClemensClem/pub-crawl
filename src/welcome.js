import React from "react";
import { HashRouter, Route } from "react-router-dom";

import Registration from "./registration";
import Login from "./login";
import ResetPassword from "./resetPassword";

export default function Welcome() {
    return (
        <div className="mainWelcome">
            <h1 className="pub-crawl-tag">Pub Crawlers</h1>
            <div className="welcomeBox">
                <HashRouter>
                    <Route exact path="/" component={Registration} />
                    <Route path="/login" component={Login} />
                    <Route path="/password/reset" component={ResetPassword} />
                </HashRouter>
            </div>
        </div>
    );
}
