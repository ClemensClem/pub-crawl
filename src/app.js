import React, { Component } from "react";
import axios from "./axios";
import { BrowserRouter, Route } from "react-router-dom";

//imports from ./src
import Uploader from "./uploader";
import Logo from "./logo";
import ProfilePic from "./profilePic";
import NavigationMenuHeader from "./navigationMenuHeader";
import Profile from "./profile";
import OtherProfile from "./otherProfile";
import FindPeople from "./findPeople";
import Friends from "./friends";
import Chat from "./chat";
import HostEvent from "./hostEvent";
import EventDetails from "./eventDetails";
import Events from "./events";
import ParticipationSuccess from "./participationSuccess";
import HostOrGuest from "./hostOrGuest";
import ParticipationLeft from "./participationLeft";

export default class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            uploaderVisible: false,
            navigationMenuVisible: false,
        };
    }

    //starting to play around with 'async' & 'await'
    async componentDidMount() {
        try {
            const { data } = await axios.get("/user");
            //destructering response and storing values as state properties
            for (const each in data) {
                this.setState({ [each]: data[each] });
            }
        } catch (err) {
            console.log('ERROR in GET "/user": ', err);
        }
    }

    toggleModal() {
        this.setState({
            uploaderVisible: !this.state.uploaderVisible,
        });
    }

    toggleNavigationMenu() {
        this.setState({
            navigationMenuVisible: !this.state.navigationMenuVisible,
        });
    }

    updateProfilePic(url) {
        this.setState({ profile_picture_url: url });
    }

    updateBio(newBio) {
        this.setState({ bio: newBio });
    }

    render() {
        return (
            <div className="mainApp">
                <BrowserRouter>
                    <header>
                        <div className="headerLeft">
                            <Logo />
                        </div>
                        <div className="headerRight">
                            <ProfilePic
                                email={this.state.email}
                                profile_picture_url={
                                    this.state.profile_picture_url
                                }
                                toggleModal={() => this.toggleModal()}
                                size=""
                            />
                            <img
                                className="navigationIconHeader"
                                src="./resources/media/menu.png"
                                onClick={() => this.toggleNavigationMenu()}
                            />
                            {this.state.navigationMenuVisible && (
                                <NavigationMenuHeader
                                    navigationMenuVisible={
                                        this.state.navigationMenuVisible
                                    }
                                    toggleNavigationMenu={() =>
                                        this.toggleNavigationMenu()
                                    }
                                />
                            )}
                        </div>
                    </header>
                    <div className="content">
                        <Route
                            path="/profile"
                            render={() => (
                                <Profile
                                    first={this.state.first}
                                    last={this.state.last}
                                    email={this.state.email}
                                    profile_picture_url={
                                        this.state.profile_picture_url
                                    }
                                    //in this property is stored if biography is existing or not
                                    bio={this.state.bio}
                                    toggleModal={() => this.toggleModal()}
                                    //you can directly pass the bio-update function to the child:
                                    updateBio={(newBio) =>
                                        this.updateBio(newBio)
                                    }
                                />
                            )}
                        />
                        {/* In Browser route you pass properties to child components that way */}
                        <Route
                            path="/user/:id"
                            render={(props) => (
                                <OtherProfile
                                    key={props.match.url}
                                    match={props.match}
                                    history={props.history}
                                    userId={this.state.id}
                                />
                            )}
                        />
                        <Route path="/users" render={() => <FindPeople />} />
                        <Route path="/friends" render={() => <Friends />} />
                        <Route path="/chat" render={() => <Chat />} />
                        <Route exact path="/" render={() => <HostOrGuest />} />
                        <Route
                            path="/host-event"
                            render={() => <HostEvent />}
                        />
                        <Route
                            path="/event-details/:id"
                            render={(props) => (
                                <EventDetails match={props.match} />
                            )}
                        />
                        <Route path="/events" render={() => <Events />} />
                        <Route
                            path="/participation-success"
                            render={() => <ParticipationSuccess />}
                        />
                        <Route
                            path="/participation-left"
                            render={() => <ParticipationLeft />}
                        />

                        {this.state.uploaderVisible && (
                            <Uploader
                                //this way you pass a function to the child
                                updateProfilePic={(url) =>
                                    this.updateProfilePic(url)
                                }
                                toggleModal={() => this.toggleModal()}
                            />
                        )}
                    </div>
                </BrowserRouter>
            </div>
        );
    }
}
