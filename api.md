### Welcome to the API Endpoints Wiki

Here we give you a comprehensive guide on how to use our API.

All requests to the endpoints should include a valid JWT in the `Authorization`
header.

```
Authorization: Bearer <JWT>
```

## User Endpoints

| Method | Route                                                               | Description                                |
| ------ | ------------------------------------------------------------------- | ------------------------------------------ |
| `GET`  | [`/user`](#get-user)                                                | Get the current user                       |
| `POST` | [`/user`](#post-user)                                               | Create a new user                          |
| `GET`  | [`/user/requests/sent`](#get-userrequestssent)                      | Retrieves all requests by this user        |
| `GET`  | [`/user/requests/received`](#get-userrequestsreceived)              | Retrieves all requests for this user       |
| `GET`  | [`/user/rides/created`](#get-userridescreated)                      | Retrieves all rides created by this user   |
| `GET`  | [`/user/rides/completed`](#get-userridescompleted)                  | Retrieves all rides completed by this user |
| `GET`  | [`/user/rides/joined`](#get-userridesjoined)                        | Retrieves all rides joined by this user    |
| `POST` | [`/user/bookmarks/create/:rideId`](#post-userbookmarkscreaterideid) | Create a bookmark for a ride               |
| `GET`  | [`/user/bookmarks/get`](#get-userbookmarksget)                      | Get all user bookmarks                     |
| `POST` | [`/user/tokens`](#post-usertokens)                                  | Register Firebase Cloud Messaging token    |

#### `GET` `/user`

This endpoint reads the email from the authorization header and returns the user
corresponding to that email.

#### Request:

#### Response:

```ts
{
  phoneNumber: string;
  name: string;
  email: string;
}
```

#### `POST` `/user`

This endpoint creates a user based on the the email from the authorization
header, and the name and phone number from the request.

#### Request:

```ts
{
  phoneNumber: string.length(10);
  name: string | null;
}
```

#### Response:

#### `GET` `/user/requests/sent`

This endpoint returns all requests sent **by** the current user.

#### Request:

#### Response:

```ts
{
  status: "accepted" | "declined" | "pending";
  id: number;
  createdBy: string;
  comments: string | null;
  departureStartTime: ISODateString;
  departureEndTime: ISODateString;
  maxMemberCount: int;
  rideStartLocation: string;
  rideEndLocation: string;
  isBookmarked: boolean;
}
[];
```

#### `GET` `/user/requests/received`

This endpoint returns all requests sent **to** the current user.

#### Request:

#### Response:

```ts
{
  requestSender: string;
  status: "accepted" | "declined" | "pending";
  id: number;
  createdBy: string;
  comments: string | null;
  departureStartTime: ISODateString;
  departureEndTime: ISODateString;
  maxMemberCount: int;
  rideStartLocation: string;
  rideEndLocation: string;
  isBookmarked: boolean;
}
[];
```

#### `GET` `/user/rides/created`

All rides which have been created by the current user.

#### Request:

#### Response:

```ts
{
  id: number;
  createdBy: string;
  comments: string | null;
  departureStartTime: ISODateString;
  departureEndTime: ISODateString;
  maxMemberCount: int;
  rideStartLocation: string;
  rideEndLocation: string;
  isBookmarked: boolean;
}
[];
```

#### `GET` `/user/rides/completed`

All rides which have been completed by the current user.

#### Request:

#### Response:

```ts
{
  id: number;
  createdBy: string;
  comments: string | null;
  departureStartTime: ISODateString;
  departureEndTime: ISODateString;
  maxMemberCount: int;
  rideStartLocation: string;
  rideEndLocation: string;
  isBookmarked: boolean;
}
[];
```

#### `GET` `/user/rides/joined`

All rides which have been joined by the current user.

#### Request:

#### Response:

```ts
{
  id: number;
  createdBy: string;
  comments: string | null;
  departureStartTime: ISODateString;
  departureEndTime: ISODateString;
  maxMemberCount: int;
  rideStartLocation: string;
  rideEndLocation: string;
  isBookmarked: boolean;
}
[];
```

#### `POST` `/user/bookmarks/create/:rideId`

Allows a user to create a bookmark for a ride.

#### Request:

#### Response:

#### `GET` `/user/bookmarks/get`

Gets all bookmarks for the current user.

#### Request:

#### Response:

```ts
{
  id: number;
  createdBy: string;
  comments: string;
  departureStartTime: ISODateString;
  departureEndTime: ISODateString;
  maxMemberCount: number;
  rideStartLocation: string;
  rideEndLocation: string;
  isBookmarked: boolean;
}
[];
```

#### `POST` `/user/tokens`

Add FCM device token for this user

#### Request:

```ts
{
  token: string;
}
```

#### Response:

status: 200

## Ride Endpoints

| Method   | Route                                                               | Description               |
| -------- | ------------------------------------------------------------------- | ------------------------- |
| `GET`    | [`/rides/get/:rideId`](#get-ridesgetrideid)                         | Get a specific ride by ID |
| `POST`   | [`/rides/create`](#post-ridescreate)                                | Create a new ride         |
| `POST`   | [`/rides/manage/requests/:rideId`](#post-ridesmanagerequestsrideid) | Accept/Deny ride request  |
| `PUT`    | [`/rides/manage/update/:rideId`](#put-ridesmanageupdaterideid)      | Update a ride             |
| `DELETE` | [`/rides/manage/dismiss/:rideId`](#delete-ridesmanagedismissrideid) | Remove a user from a ride |
| `DELETE` | [`/rides/manage/delete/:rideId`](#delete-ridesmanagedeleterideid)   | Delete a ride             |
| `POST`   | [`/rides/request/:rideId`](#post-ridesrequestrideid)                | Create a ride request     |
| `DELETE` | [`/rides/request/:rideId`](#delete-ridesrequestrideid)              | Cancel a ride request     |
| `DELETE` | [`/rides/exit/:rideId`](#delete-ridesexitrideid)                    | Leave a ride              |
| `GET`    | [`/rides/search/`](#get-ridessearch)                                | Search for a ride         |
| `GET`    | [`/rides/members/:rideId`](#get-ridesmembersrideid)                 | Get all members of ride   |

#### `GET` `/rides/get/:rideId`

Retrieves a ride based on rideId param.

#### Request:

#### Response:

```ts
{
  id: number;
  createdBy: string;
  comments: string | null;
  departureStartTime: ISODateString;
  departureEndTime: ISODateString;
  maxMemberCount: int;
  rideStartLocation: string;
  rideEndLocation: string;
  isBookmarked: boolean;
}
```

#### `POST` `/rides/create/`

Creates a ride based on the query provided. Now < Start time < End time.

#### Request:

```ts
{
  departureStartTime: ISODateString,
  departureEndTime: ISODateString,
  comments: string | null,
  maxMemberCount: int > 1, // Must have space for at least the owner
  rideStartLocation: string, // start location of ride
  rideEndLocation: string, // end location of ride
}
```

#### Response:

#### `POST` `/rides/manage/requests/:rideId`

Accepts/Denies a ride request for a specific ride. Only owners can perform this
action.

#### Request:

```ts
{
  requestUserEmail: string, // email of the user whose request the owner wishes to handle
  status: "accepted" | "declined",
}
```

#### Response:

#### `PUT` `/rides/manage/update/:rideId`

Updates a ride based on the parameters provided. Every parameter in this request
is optional, but one must be provided.

#### Request:

```ts
{
  departureStartTime: ISODateString (optional),
  departureEndTime: ISODateString (optional) ,
  comments: string (optional),
  maxMemberCount: int > 1 (optional),  // Must have space for at least the owner
  rideStartLocation: string (optional),
  rideEndLocation: string (optional),
}
```

#### Response:

#### `DELETE` `/rides/manage/dismiss/:rideId`

Removes a user from the give ride. Only ride owners can perform this action and
the ride owner cannot be removed from the ride.

#### Request:

```ts
{
  dismissUserEmail: z.string(), // email of the user who the owner wishes to dismiss
}
```

#### Response:

#### `DELETE` `/rides/manage/delete/:rideId`

Deletes a ride based on rideID. Only ride owners can perform this action.

#### Request:

#### Response:

#### `POST` `/rides/request/:rideId`

Sends a request to join the given ride from the current user.

#### Request:

#### Response:

#### `DELETE` `/rides/request/:rideId`

Deletes a request to join the given ride from the current user.

#### Request:

#### Response:

#### `DELETE` `/rides/exit/:rideId`

Allows a user to leave from a ride. Ride owners cannot do this.

#### Request:

#### Response:

#### `GET` `/rides/search/`

Searches for a ride based on the search locations and times provided. Atleast
and Only one of `from` or `by` must be provided.

#### Request:

```ts
{
  searchStartLocation: string,
  searchEndLocation: string,
  from: ISODateString (optional),
  by: ISODateString (optional),
}
```

#### Response:

```ts
{
  id: number;
  createdBy: string;
  comments: string | null;
  departureStartTime: ISODateString;
  departureEndTime: ISODateString;
  maxMemberCount: int;
  rideStartLocation: string;
  rideEndLocation: string;
  isBookmarked: boolean;
}
[];
```

#### `GET` `/rides/members/:rideId`

Gets all members of given ride.

#### Request:

#### Response:

```ts
{
  phoneNumber: string;
  name: string;
  email: string;
}
[];
```
