//"useState" is a hook that will allow us to use state within a function component
//useEffect is the hook-substitute for lifecycle method "componentDidMount"
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import axios from "./axios";

export default function FindPeople() {
    //use State returns an array with two elements
    //"users" is assigned the state property, and setUsers is the function to set a state; users and setUsers are just to names made up for the two properties in useState()
    //in "useState([])"" "[]" is the default value for the state property "users"
    //each time you want to set a state property you need to call the function
    //here "setUsers" can only update "users"
    const [users, setUsers] = useState([]);
    //useState is assigmed the default value "<space>" so that initial GET request on component mount can be identified
    const [searchString, setSearchString] = useState(" ");

    //tracks errors in the "/find-users/..." GET request
    const [error, setError] = useState(false);

    //needs a function as an argument
    //runs when component mounts and runs every single time "state" is updated by useState()
    //there can be added a second argument to useEffect to modify its behaviour:
    //if you pass an empty array as second argument useEffect will only run when component mounts and never again afterwards --> pasisng a variable to the array useEffect will run when this variable/property changes!
    useEffect(() => {
        //to use async you need to create an iefe
        (async () => {
            console.log("searchString: ", searchString);
            try {
                let { data } = await axios.get(
                    `/find-users/${searchString}.json`
                );
                console.log("data: ", data);
                setUsers(data);
            } catch (err) {
                console.log('Error in GET "/find-users": ', err);
                setError(true);
            }
        })();
    }, [searchString]);

    //findUsers is asynchronous!
    const findUsers = (e) => {
        if (e.target.value === "") {
            setSearchString(" ");
        } else {
            setSearchString(e.target.value);
        }
    };

    return (
        <div className="findPeople">
            <h1>Search your Campsite for Friends</h1>
            <input onChange={findUsers}></input>
            {
                //Error handling
                error && <h3>Something went wrong, please try again...</h3>
            }
            {
                // if searchString equals "<space>" the default search query resulting in the 3 most recent signed up users is triggered
                searchString === " " && <h3>They have registered recently:</h3>
            }
            <div className="searchResults">
                {users.map((user) => {
                    //key is important because react demands an unique key. React asks in cases where a list is rendered
                    return (
                        <div key={user.id} className="userBox">
                            <h3>
                                {user.first} {user.last}
                            </h3>
                            <Link to={`/user/${user.id}`}>
                                <img
                                    src={user.profile_picture_url}
                                    alt={`${user.first} ${user.last}`}
                                />
                            </Link>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
