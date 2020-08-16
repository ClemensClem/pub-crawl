const spicedPg = require("spiced-pg");
let db;
if (process.env.DATABASE_URL) {
    //this will run if Social Network is running on heroku
    db = spicedPg(process.env.DATABASE_URL);
} else {
    //this will run if project is running on localhost
    db = spicedPg(
        process.env.DATABASE_URL ||
            "postgres:postgres:postgres@localhost:5432/pub_crawl"
    );
}

module.exports.addUser = (first, last, email, password) => {
    return db.query(
        `INSERT INTO users (first, last, email, password) VALUES ($1, $2, $3, $4) RETURNING id`,
        [first, last, email, password]
    );
};

module.exports.addResetCode = (email, code) => {
    return db.query(
        `INSERT INTO reset_codes (email, code) VALUES ($1, $2) RETURNING id`,
        [email, code]
    );
};

module.exports.addFriendRequest = (senderId, receiverId) => {
    return db.query(
        `INSERT INTO friendships (sender_id, receiver_id, accepted) VALUES ($1, $2, false)`,
        [senderId, receiverId]
    );
};

module.exports.addNewMessage = (msg, senderId) => {
    return db.query(
        `INSERT INTO community_chat (msg, sender_id) VALUES ($1, $2) RETURNING id AS message_id`,
        [msg, senderId]
    );
};

module.exports.addEventData = (hostId, mapData) => {
    return db.query(
        `INSERT INTO mapData (host, map_data) VALUES ($1, $2) RETURNING id AS event_id`,
        [hostId, mapData]
    );
};

module.exports.addParticipant = (eventId, participantId) => {
    return db.query(
        `INSERT INTO event_participants (event_id, participant_id) VALUES ($1, $2)`,
        [eventId, participantId]
    );
};

module.exports.deleteFriendship = (senderId, receiverId) => {
    return db.query(
        `DELETE FROM friendships WHERE (receiver_id = $1 AND sender_id = $2) OR (receiver_id = $2 AND sender_id = $1);`,
        [senderId, receiverId]
    );
};

module.exports.deleteParticipation = (eventId, participantId) => {
    return db.query(
        `DELETE FROM event_participants WHERE event_id = $1 AND participant_id = $2;`,
        [eventId, participantId]
    );
};

module.exports.getPassword = (email) => {
    return db.query(`SELECT id, password FROM users WHERE email = $1`, [email]);
};

module.exports.getResetCode = (email) => {
    return db.query(
        `SELECT code FROM reset_codes WHERE CURRENT_TIMESTAMP - created_at < INTERVAL '10 minutes' AND email = $1 ORDER BY id DESC
      LIMIT 1`,
        [email]
    );
};

module.exports.getUser = (userId) => {
    return db.query(
        `SELECT users.id, users.first, users.last, users.email, users.profile_picture_url, users.bio FROM users WHERE id=$1`,
        [userId]
    );
};

module.exports.getMostRecentlyRegisteredUser = () => {
    return db.query(
        `SELECT users.id, users.first, users.last, users.email, users.profile_picture_url, users.bio FROM users ORDER BY id DESC LIMIT 3;`
    );
};

module.exports.getMatchingUsers = (userSearch) => {
    return db.query(
        `SELECT users.id, users.first, users.last, users.email, users.profile_picture_url, users.bio FROM users WHERE first ILIKE $1;`,
        [userSearch + "%"]
    );
};

module.exports.getFriendshipState = (receiverId, senderId) => {
    return db.query(
        `SELECT * FROM friendships WHERE (receiver_id = $1 AND sender_id = $2) OR (receiver_id = $2 AND sender_id = $1);`,
        [receiverId, senderId]
    );
};

module.exports.getFriends = (loggedInUser) => {
    return db.query(
        `SELECT users.id, users.first, users.last, users.profile_picture_url, users.bio, friendships.sender_id, friendships.receiver_id, friendships.accepted 
        FROM friendships 
        JOIN users 
        ON (accepted = false AND friendships.receiver_id = $1 AND friendships.sender_id = users.id) 
        OR (accepted = false AND friendships.receiver_id = users.id AND friendships.sender_id = $1) 
        OR (accepted = true AND friendships.receiver_id = $1 AND friendships.sender_id = users.id) 
        OR (accepted = true AND friendships.sender_id = $1 AND friendships.receiver_id = users.id)`,
        [loggedInUser]
    );
};

module.exports.getCommunityChat = () => {
    return db.query(
        `SELECT users.id, users.first, users.last, users.profile_picture_url, community_chat.id AS msg_id, community_chat.msg, community_chat.sender_id, community_chat.created_at
        FROM community_chat
        JOIN users
        ON users.id = community_chat.sender_id
        ORDER BY msg_id DESC 
        LIMIT 10`
    );
};

module.exports.getNewMessage = (message_id) => {
    return db.query(
        `SELECT users.id, users.first, users.last, users.profile_picture_url, community_chat.id AS msg_id, community_chat.msg, community_chat.sender_id, community_chat.created_at
        FROM community_chat
        JOIN users
        ON users.id = community_chat.sender_id
        WHERE community_chat.id = $1`,
        [message_id]
    );
};

module.exports.getCommonFriends = (loggedInUserId, otherProfileUserId) => {
    return db.query(
        `SELECT * FROM
  (
        SELECT users.id, users.first, users.last, users.profile_picture_url, users.bio, friendships.sender_id, friendships.receiver_id, friendships.accepted 
        FROM friendships 
        JOIN users 
        ON (accepted = true AND friendships.receiver_id = $1 AND friendships.sender_id = users.id) 
        OR (accepted = true AND friendships.sender_id = $1 AND friendships.receiver_id = users.id)
  ) tbl1
  join (
        SELECT users.id, users.first, users.last, users.profile_picture_url, users.bio, friendships.sender_id, friendships.receiver_id, friendships.accepted 
        FROM friendships 
        JOIN users 
        ON (accepted = true AND friendships.receiver_id = $2 AND friendships.sender_id = users.id) 
        OR (accepted = true AND friendships.sender_id = $2 AND friendships.receiver_id = users.id)
  ) tbl2
  ON tbl1.id = tbl2.id`,
        [loggedInUserId, otherProfileUserId]
    );
};

module.exports.getEventDetails = (eventId) => {
    return db.query(
        `SELECT id, host, map_data, title, description, TO_CHAR(start_date :: DATE, 'YYYY-MM-DD') AS start_date, start_time, event_picture_url, created_at FROM mapData WHERE id=$1`,
        [eventId]
    );
};

module.exports.getParticipants = (eventId) => {
    return db.query(
        `SELECT users.id, users.first, users.last, users.profile_picture_url, event_participants.event_id, event_participants.participant_id 
        FROM users 
        JOIN event_participants
        ON users.id = event_participants.participant_id
        WHERE event_participants.event_id = $1`,
        [eventId]
    );
};

module.exports.getEvents = () => {
    return db.query(
        `SELECT mapData.id, mapData.host, mapData.title, mapData.description, TO_CHAR(mapData.start_date :: DATE, 'YYYY-MM-DD') AS start_date, mapData.start_time, mapData.event_picture_url, mapData.created_at, users.first, users.last, users.profile_picture_url 
        FROM mapData
        JOIN users
        ON users.id = mapData.host;`,
        []
    );
};

module.exports.updateUserPassword = (password, email) => {
    return db.query(`UPDATE users SET password=$1 WHERE email=$2`, [
        password,
        email,
    ]);
};

module.exports.updateProfilePic = (url, userId) => {
    return db.query(`UPDATE users SET profile_picture_url=$1 WHERE id=$2`, [
        url,
        userId,
    ]);
};

module.exports.updateBio = (bio, userId) => {
    return db.query(`UPDATE users SET bio=$1 WHERE id=$2`, [bio, userId]);
};

module.exports.updateFriendship = (senderId, receiverId) => {
    return db.query(
        `UPDATE friendships SET accepted=true WHERE (receiver_id = $1 AND sender_id = $2) OR (receiver_id = $2 AND sender_id = $1);`,
        [senderId, receiverId]
    );
};

module.exports.updateEventData = (mapData, eventId) => {
    return db.query(`UPDATE mapData SET map_data=$1 WHERE id=$2`, [
        mapData,
        eventId,
    ]);
};

module.exports.updateEventPic = (url, eventId) => {
    return db.query(`UPDATE mapData SET event_picture_url=$1 WHERE id=$2`, [
        url,
        eventId,
    ]);
};

module.exports.updateEventDescription = (
    eventId,
    title,
    description,
    date,
    time
) => {
    return db.query(
        `UPDATE mapData SET title=$2, description=$3, start_date=$4, start_time=$5 WHERE id=$1`,
        [eventId, title, description, date, time]
    );
};

module.exports.checkEMail = (email) => {
    return db.query(`SELECT first, last FROM users WHERE email = $1`, [email]);
};

module.exports.checkParticipation = (eventId, participantId) => {
    return db.query(
        `SELECT event_Id FROM event_participants WHERE event_id = $1 AND participant_id = $2`,
        [eventId, participantId]
    );
};
