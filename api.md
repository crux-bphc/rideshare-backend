### Welcome to the API Endpoints Wiki

Here we give you a comprehensive guide on how to use our API.

All requests to the endpoints should include a valid JWT in the `Authorization`
header.

```
Authorization: Bearer <JWT>
```

## User Endpoints

| Method | Route                                                  | Description                          |
| ------ | ------------------------------------------------------ | ------------------------------------ |
| `GET`  | [`/user`](#get-user)                                   | Get the current user                 |
| `POST` | [`/user`](#post-user)                                  | Create a new user                    |
| `GET`  | [`/user/requests/sent`](#get-userrequestssent)         | Retrieves all requests by this user  |
| `GET`  | [`/user/requests/received`](#get-userrequestsreceived) | Retrieves all requests for this user |

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
  userEmail: string;
  rideId: number;
  status: "accepted" | "declined" | "pending";
}
[];
```

#### `GET` `/user/requests/received`

This endpoint returns all requests sent **to** the current user.

#### Request:

#### Response:

```ts
{
  userEmail: string;
  rideId: number;
  status: "accepted" | "declined" | "pending";
}
[];
```

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
  ride_start_location: string;
  ride_end_location: string;
}
```

#### `POST` `/rides/create/`

Creates a ride based on the query provided.

#### Request:

```ts
{
  departureStartTime: ISODateString,
  departureEndTime: ISODateString,
  comments: string | null,
  maxMemberCount: int > 1, // Must have space for at least the owner
  rideStart: string, // start location of ride
  rideEnd: string, // end location of ride
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
  rideStart: string (optional),
  rideEnd: string (optional),
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

Searches for a ride based on the search locations and times provided

#### Request:

```ts
{
  search_start_location: string,
  search_end_location: string,
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
  ride_start_location: string;
  ride_end_location: string;
}
[];
```
