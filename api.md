### Welcome to the API Endpoints Wiki

Here we give you a comprehensive guide on how to use our API.

All requests to the endpoints should include a valid JWT in the `Authorization`
header.

```
Authorization: Bearer <JWT>
```

## User Endpoints

| Method   | Route                                                                 | Description                                |
| -------- | --------------------------------------------------------------------- | ------------------------------------------ |
| `GET`    | [`/user`](#get-user)                                                  | Get the current user                       |
| `GET`    | [`/user/email`](#get-useremail)                                       | Get user by email                          |
| `POST`   | [`/user`](#post-user)                                                 | Create a new user                          |
| `GET`    | [`/user/requests/sent`](#get-userrequestssent)                        | Retrieves all requests by this user        |
| `GET`    | [`/user/requests/received`](#get-userrequestsreceived)                | Retrieves all requests for this user       |
| `GET`    | [`/user/rides/created`](#get-userridescreated)                        | Retrieves all rides created by this user   |
| `GET`    | [`/user/rides/completed`](#get-userridescompleted)                    | Retrieves all rides completed by this user |
| `GET`    | [`/user/rides/joined`](#get-userridesjoined)                          | Retrieves all rides joined by this user    |
| `POST`   | [`/user/bookmarks/create/:rideId`](#post-userbookmarkscreaterideid)   | Create a bookmark for a ride               |
| `DELETE` | [`/user/bookmarks/delete/:rideId`](#delete-userbookmarksdeleterideid) | Delete a bookmark for a ride               |
| `GET`    | [`/user/bookmarks/get`](#get-userbookmarksget)                        | Get all user bookmarks                     |
| `POST`   | [`/user/tokens`](#post-usertokens)                                    | Register Firebase Cloud Messaging token    |

#### `GET` `/user`

This endpoint reads the email from the authorization header and returns the user
corresponding to that email.

##### Request:

No body required. Email is extracted from JWT.

##### Response:

```ts
{
  phoneNumber: string;
  name: string | null;
  email: string;
}
```

##### Status Codes:

- 200: Success
- 400: Email not provided in JWT
- 404: User not found

#### `GET` `/user/email`

This endpoint retrieves a user by their email address.

##### Request:

**Query Parameters:**

```ts
{
  email: string; // Valid email address
}
```

##### Response:

```ts
{
  phoneNumber: string;
  name: string | null;
  email: string;
}
```

##### Status Codes:

- 200: Success
- 404: User not found

#### `POST` `/user`

This endpoint creates a new user based on the email from the authorization
header, and the name and phone number from the request body.

##### Request:

```ts
{
  phoneNumber: string; // Exactly 10 digits, numeric only
  name: string | null | undefined; // Optional, will use JWT name if not provided
}
```

##### Response:

```ts
{
  message: "User created successfully";
}
```

##### Status Codes:

- 201: User created successfully
- 400: Email not provided or invalid phone number format
- 409: User already exists

#### `GET` `/user/requests/sent`

This endpoint returns all join requests sent **by** the current user.

##### Request:

No body required.

##### Response:

```ts
{
  status: "accepted" | "declined" | "pending";
  id: number;
  createdBy: string;
  comments: string | null;
  departureStartTime: string; // ISO datetime
  departureEndTime: string; // ISO datetime
  maxMemberCount: number;
  rideStartLocation: string;
  rideEndLocation: string;
  isBookmarked: boolean;
}
[];
```

##### Status Codes:

- 200: Success
- 400: Email not provided
- 404: No requests found

#### `GET` `/user/requests/received`

This endpoint returns all join requests received **by** the current user (user
is the ride owner).

##### Request:

No body required.

##### Response:

```ts
{
  requestSender: string; // Email of user who sent request
  status: "accepted" | "declined" | "pending";
  id: number;
  createdBy: string;
  comments: string | null;
  departureStartTime: string; // ISO datetime
  departureEndTime: string; // ISO datetime
  maxMemberCount: number;
  rideStartLocation: string;
  rideEndLocation: string;
  isBookmarked: boolean;
}
[];
```

##### Status Codes:

- 200: Success
- 400: Email not provided
- 404: No requests found

#### `GET` `/user/rides/created`

All rides which have been created by the current user.

##### Request:

No body required.

##### Response:

```ts
{
  id: number;
  createdBy: string;
  comments: string | null;
  departureStartTime: string; // ISO datetime
  departureEndTime: string; // ISO datetime
  maxMemberCount: number;
  rideStartLocation: string;
  rideEndLocation: string;
  isBookmarked: boolean;
}
[];
```

##### Status Codes:

- 200: Success
- 400: Email not provided
- 404: User has not created any rides

#### `GET` `/user/rides/completed`

All rides which have been completed by the current user (rides where
departureEndTime is in the past).

##### Request:

No body required.

##### Response:

```ts
{
  id: number;
  createdBy: string;
  comments: string | null;
  departureStartTime: string; // ISO datetime
  departureEndTime: string; // ISO datetime
  maxMemberCount: number;
  rideStartLocation: string;
  rideEndLocation: string;
  isBookmarked: boolean;
}
[];
```

##### Status Codes:

- 200: Success
- 400: Email not provided
- 404: User has not completed any rides

#### `GET` `/user/rides/joined`

All rides which have been joined by the current user (excluding rides they
created).

##### Request:

No body required.

##### Response:

```ts
{
  id: number;
  createdBy: string;
  comments: string | null;
  departureStartTime: string; // ISO datetime
  departureEndTime: string; // ISO datetime
  maxMemberCount: number;
  rideStartLocation: string;
  rideEndLocation: string;
  isBookmarked: boolean;
}
[];
```

##### Status Codes:

- 200: Success
- 400: Email not provided
- 404: User has not joined any rides

#### `POST` `/user/bookmarks/create/:rideId`

Allows a user to create a bookmark for a ride.

##### Request:

**URL Parameters:**

```ts
{
  rideId: number; // Ride ID to bookmark
}
```

No body required.

##### Response:

```ts
{
  message: "Bookmark Created Successfully.";
}
```

##### Status Codes:

- 200: Success
- 400: Email not provided
- 404: Ride not found

#### `DELETE` `/user/bookmarks/delete/:rideId`

Allows a user to delete a bookmark for a ride.

##### Request:

**URL Parameters:**

```ts
{
  rideId: number; // Ride ID to unbookmark
}
```

No body required.

##### Response:

Empty response on success.

##### Status Codes:

- 200: Success
- 400: Email not provided
- 404: Bookmark not found

#### `GET` `/user/bookmarks/get`

Gets all bookmarks for the current user.

##### Request:

No body required.

##### Response:

```ts
{
  id: number;
  createdBy: string;
  comments: string | null;
  departureStartTime: string; // ISO datetime
  departureEndTime: string; // ISO datetime
  maxMemberCount: number;
  rideStartLocation: string;
  rideEndLocation: string;
  isBookmarked: boolean; // Always true for bookmarked rides
}
[];
```

##### Status Codes:

- 200: Success
- 400: Email not provided
- 404: No bookmarks found for user

#### `POST` `/user/tokens`

Register a Firebase Cloud Messaging (FCM) device token for push notifications.

##### Request:

```ts
{
  token: string; // FCM device token from Firebase
}
```

##### Response:

Empty response on success.

##### Status Codes:

- 200: Success
- 400: Email not provided

## Ride Endpoints

| Method   | Route                                                               | Description               |
| -------- | ------------------------------------------------------------------- | ------------------------- |
| `GET`    | [`/rides/get/:rideId`](#get-ridesgetrideid)                         | Get a specific ride by ID |
| `POST`   | [`/rides/create`](#post-ridescreate)                                | Create a new ride         |
| `POST`   | [`/rides/request/:rideId`](#post-ridesrequestrideid)                | Create a ride request     |
| `DELETE` | [`/rides/request/:rideId`](#delete-ridesrequestrideid)              | Cancel a ride request     |
| `DELETE` | [`/rides/exit/:rideId`](#delete-ridesexitrideid)                    | Leave a ride              |
| `GET`    | [`/rides/search`](#get-ridessearch)                                 | Search for rides          |
| `GET`    | [`/rides/members/:rideId`](#get-ridesmembersrideid)                 | Get all members of ride   |
| `GET`    | [`/rides/location/id`](#get-rideslocationid)                        | Get location by ID        |
| `GET`    | [`/rides/location/search`](#get-rideslocationssearch)               | Search locations by name  |
| `POST`   | [`/rides/location`](#post-rideslocation)                            | Create a new location     |
| `POST`   | [`/rides/manage/requests/:rideId`](#post-ridesmanagerequestsrideid) | Accept/Deny ride request  |
| `PUT`    | [`/rides/manage/update/:rideId`](#put-ridesmanageupdaterideid)      | Update a ride             |
| `DELETE` | [`/rides/manage/delete/:rideId`](#delete-ridesmanagedeleterideid)   | Delete a ride             |
| `DELETE` | [`/rides/manage/dismiss/:rideId`](#delete-ridesmanagedismissrideid) | Remove a user from a ride |

#### `GET` `/rides/get/:rideId`

Retrieves a specific ride by its ID.

##### Request:

**URL Parameters:**

```ts
{
  rideId: number; // Ride ID
}
```

No body required.

##### Response:

```ts
{
  id: number;
  createdBy: string; // Email of ride creator
  comments: string | null;
  departureStartTime: string; // ISO datetime
  departureEndTime: string; // ISO datetime
  maxMemberCount: number;
  rideStartLocation: string; // Location name or ID
  rideEndLocation: string; // Location name or ID
  isBookmarked: boolean;
}
```

##### Status Codes:

- 200: Success
- 400: Email not provided
- 404: Ride not found

#### `POST` `/rides/create`

Creates a new ride. The current user is automatically added as a ride member.

##### Request:

```ts
{
  departureStartTime: string; // ISO datetime, must be >= now
  departureEndTime: string; // ISO datetime, must be > departureStartTime
  comments: string | null; // Optional comments about the ride
  maxMemberCount: number; // Must be >= 1 (includes creator)
  rideStartLocation: string; // Starting location name
  rideEndLocation: string; // Ending location name
}
```

##### Response:

Empty response on success.

##### Status Codes:

- 200: Success
- 400: Email not provided or invalid times/parameters
- 409: Conflict with data

#### `POST` `/rides/request/:rideId`

Sends a request to join a ride. Ride owner will receive a notification.

##### Request:

**URL Parameters:**

```ts
{
  rideId: number; // Ride ID to request join
}
```

No body required.

##### Response:

Empty response on success.

##### Status Codes:

- 200: Success (or already requested)
- 400: Email not provided
- 404: Ride not found
- 409: User is already a member or ride is full
- 503: Ride is full

#### `DELETE` `/rides/request/:rideId`

Cancels a pending join request. Can only delete requests that haven't been
reviewed yet.

##### Request:

**URL Parameters:**

```ts
{
  rideId: number; // Ride ID to cancel request for
}
```

No body required.

##### Response:

Empty response on success.

##### Status Codes:

- 200: Success
- 400: Email not provided
- 404: Request not found
- 423: Cannot delete request (already accepted or declined)

#### `DELETE` `/rides/exit/:rideId`

Allows a user to leave a ride. Ride owners cannot leave (must delete instead).
Notifies ride owner and members.

##### Request:

**URL Parameters:**

```ts
{
  rideId: number; // Ride ID to exit
}
```

No body required.

##### Response:

Empty response on success.

##### Status Codes:

- 200: Success
- 400: Email not provided
- 404: Ride not found or user not a member
- 409: User is the ride owner

#### `GET` `/rides/search`

Searches for rides based on location and time. Uses fuzzy matching on location
names.

##### Request:

**Query Parameters:**

```ts
{
  searchStartLocation: string; // Starting location to search for
  searchEndLocation: string; // Ending location to search for
  from?: string; // ISO datetime - find rides departing around this time
  by?: string; // ISO datetime - find rides arriving around this time
  // Note: Exactly one of 'from' or 'by' must be provided
}
```

No body required.

##### Response:

```ts
{
  id: number;
  createdBy: string;
  comments: string | null;
  departureStartTime: string; // ISO datetime
  departureEndTime: string; // ISO datetime
  maxMemberCount: number;
  rideStartLocation: string;
  rideEndLocation: string;
  isBookmarked: boolean;
}
[];
// Results are ordered by location similarity (highest first), then by time proximity
```

##### Status Codes:

- 200: Success (may return empty array)
- 400: Email not provided or invalid query parameters

#### `GET` `/rides/members/:rideId`

Gets all members of a specific ride.

##### Request:

**URL Parameters:**

```ts
{
  rideId: number; // Ride ID
}
```

No body required.

##### Response:

```ts
{
  phoneNumber: string;
  name: string | null;
  email: string;
}
[];
```

##### Status Codes:

- 200: Success
- 404: Ride not found

#### `GET` `/rides/location/id`

Fetches a location by its ID.

##### Request:

**Query Parameters:**

```ts
{
  id: number; // Location ID
}
```

##### Response:

```ts
{
  id: number;
  location: string; // Location name
}
```

##### Status Codes:

- 200: Success
- 400: Email not provided
- 404: Location not found

#### `GET` `/rides/location/search`

Searches for locations by name using fuzzy matching. Returns up to 5 results.

##### Request:

**Query Parameters:**

```ts
{
  location: string; // Location name to search for
}
```

##### Response:

```ts
{
  id: number;
  location: string; // Location name
}
[];
```

##### Status Codes:

- 200: Success (may return empty array)
- 400: Email not provided

#### `POST` `/rides/location`

Creates a new location. Used when a location doesn't exist yet.

##### Request:

**Query Parameters:**

```ts
{
  location: string; // New location name
}
```

No body required.

##### Response:

```ts
number; // The ID of the newly created location
```

##### Status Codes:

- 200: Success
- 400: Email not provided
- 409: Location already exists

#### `POST` `/rides/manage/requests/:rideId`

Accept or decline a join request for a ride. Only the ride owner can perform
this action.

##### Request:

**URL Parameters:**

```ts
{
  rideId: number; // Ride ID
}
```

**Body:**

```ts
{
  requestUserEmail: string; // Email of user whose request to handle
  status: "accepted" | "declined"; // Action to take
}
```

##### Response:

Empty response on success.

##### Status Codes:

- 200: Success
- 400: Email not provided
- 401: User is not the ride owner
- 404: Ride or request not found
- 409: User is already a member
- 503: Ride is full (cannot accept)

#### `PUT` `/rides/manage/update/:rideId`

Updates ride details. Only the ride owner can perform this action. At least one
field must be provided.

##### Request:

**URL Parameters:**

```ts
{
  rideId: number; // Ride ID
}
```

**Body (all fields optional, but at least one required):**

```ts
{
  departureStartTime?: string; // ISO datetime
  departureEndTime?: string; // ISO datetime
  comments?: string | null; // Update comments
  maxMemberCount?: number; // Must be >= current member count
  rideStartLocation?: string; // New start location
  rideEndLocation?: string; // New end location
}
```

##### Response:

Empty response on success.

##### Status Codes:

- 200: Success
- 400: Email not provided, no fields provided, or invalid data
- 401: User is not the ride owner
- 404: Ride not found
- 409: Max member count less than current members

#### `DELETE` `/rides/manage/delete/:rideId`

Deletes a ride. Only the ride owner can perform this action. All members are
notified. Cascade deletes members and requests.

##### Request:

**URL Parameters:**

```ts
{
  rideId: number; // Ride ID to delete
}
```

No body required.

##### Response:

Empty response on success.

##### Status Codes:

- 200: Success
- 400: Email not provided
- 401: User is not the ride owner
- 404: Ride not found

#### `DELETE` `/rides/manage/dismiss/:rideId`

Removes a user from a ride. Only the ride owner can perform this action. The
ride owner cannot be dismissed.

##### Request:

**URL Parameters:**

```ts
{
  rideId: number; // Ride ID
}
```

**Body:**

```ts
{
  dismissUserEmail: string; // Email of user to remove from ride
}
```

##### Response:

Empty response on success.

##### Status Codes:

- 200: Success
- 400: Email not provided
- 401: User is not the ride owner
- 404: Ride not found or user not a member
- 409: Cannot dismiss the ride owner
