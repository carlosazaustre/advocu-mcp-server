# API Documentation

This document covers both **Microsoft MVP API** and **Google GDE API (Advocu)**.

---

# Microsoft MVP API

## Base URL
```
https://mavenapi-prod.azurewebsites.net/api
```

## Authentication
```
Authorization: Bearer <token>
```

## Endpoint: POST /Activities/

### Request Format

The activity must be wrapped in an `activity` object:

```json
{
  "activity": {
    // ... activity fields
  }
}
```

### Required Headers

```
Content-Type: application/json
Authorization: Bearer <token>
Referer: https://mvp.microsoft.com/
Origin: https://mvp.microsoft.com
```

---

## MVP Activity Types

### Video

**Activity Type**: `"Video"`

**Valid Roles**: `"Host"`, `"Presenter"`, `"Speaker"`

| Name | Type | Description | Restrictions |
|------|------|-------------|-------------|
| id | integer | Activity ID | Always 0 for new activities |
| activityTypeName | string | Activity type | Must be "Video" |
| typeName | string | Type name | Must be "Video" |
| date | string | Publication date | ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ) |
| title | string | Video title | min 1, max 100 characters |
| description | string | Description | max 1000 characters |
| url | string | Video URL | Must start with https:// |
| isPrivate | boolean | Private activity | true/false |
| targetAudience | array | Target audiences | enum: Developer, Technical Decision Maker, Business Decision Maker, Student, IT Pro, End User |
| tenant | string | Tenant | Always "MVP" |
| userProfileId | integer | Your profile ID | Your MVP profile ID |
| role | string | Your role | enum: Host, Presenter, Speaker |
| technologyFocusArea | string | Main tech area | e.g., "Web Development", "Cloud & AI" |
| additionalTechnologyAreas | array | Additional areas | Always empty array [] |
| liveStreamViews | integer | Livestream views | minimum 0 |
| onDemandViews | integer | On-demand views | minimum 0 |
| numberOfSessions | integer | Number of sessions | minimum 1, default 1 |
| inPersonAttendees | integer | In-person attendees | Always 0 for videos |
| subscriberBase | integer | Subscriber base | Always 0 for videos |
| imageUrl | string | Image URL | Empty string "" |

**Example**:
```json
{
  "activity": {
    "id": 0,
    "activityTypeName": "Video",
    "typeName": "Video",
    "date": "2025-07-10T00:00:00.000Z",
    "title": "Como TERMINAR con el drama de Angular 20",
    "description": "Video tutorial explicando como resolver problemas comunes en Angular 20...",
    "url": "https://www.youtube.com/watch?v=OXlWMbrGgxk",
    "isPrivate": false,
    "targetAudience": ["Developer"],
    "tenant": "MVP",
    "userProfileId": 399243,
    "role": "Host",
    "technologyFocusArea": "Web Development",
    "additionalTechnologyAreas": [],
    "liveStreamViews": 0,
    "onDemandViews": 8619,
    "numberOfSessions": 1,
    "inPersonAttendees": 0,
    "subscriberBase": 0,
    "imageUrl": ""
  }
}
```

**Response** (201 Created):
```json
{
  "contributionId": 351180
}
```

---

### Blog

**Activity Type**: `"Blog"`

**Valid Roles**: `"Author"`, `"Co-Author"`, `"Contributor"`

| Name | Type | Description | Restrictions |
|------|------|-------------|-------------|
| id | integer | Activity ID | Always 0 for new |
| activityTypeName | string | Activity type | Must be "Blog" |
| typeName | string | Type name | Must be "Blog" |
| date | string | Publication date | ISO 8601 format |
| title | string | Blog title | min 1, max 100 |
| description | string | Description | max 1000 |
| url | string | Blog URL | https:// |
| isPrivate | boolean | Private | - |
| targetAudience | array | Audiences | See Video section |
| tenant | string | Tenant | "MVP" |
| userProfileId | integer | Profile ID | Your ID |
| role | string | Role | Author, Co-Author, Contributor |
| technologyFocusArea | string | Tech area | - |
| additionalTechnologyAreas | array | Additional | [] |
| numberOfViews | integer | Total views | minimum 0 |
| subscriberBase | integer | Subscribers | minimum 0 |
| imageUrl | string | Image | "" |

---

### Speaking (Conference)

**Activity Type**: `"Speaking (Conference)"`

**Valid Roles**: `"Speaker"`, `"Panelist"`, `"Moderator"`, `"Presenter"`

| Name | Type | Description | Restrictions |
|------|------|-------------|-------------|
| id | integer | Activity ID | Always 0 |
| activityTypeName | string | Activity type | "Speaking (Conference)" |
| typeName | string | Type name | "Speaking" |
| date | string | Event date | ISO 8601 |
| title | string | Talk title | min 1, max 100 |
| description | string | Description | max 1000 |
| url | string | Event URL | https:// |
| isPrivate | boolean | Private | - |
| targetAudience | array | Audiences | See Video section |
| tenant | string | Tenant | "MVP" |
| userProfileId | integer | Profile ID | Your ID |
| role | string | Role | Speaker, Panelist, Moderator, Presenter |
| technologyFocusArea | string | Tech area | - |
| additionalTechnologyAreas | array | Additional | [] |
| inPersonAttendees | integer | In-person | minimum 0 |
| numberOfSessions | integer | Sessions | minimum 1 |
| liveStreamViews | integer | Stream views | minimum 0 (optional) |
| onDemandViews | integer | On-demand | minimum 0 (optional) |
| imageUrl | string | Image | "" |

---

### Book/E-book

**Activity Type**: `"Book/E-book"`

**Valid Roles**: `"Author"`, `"Co-Author"`

| Name | Type | Description | Restrictions |
|------|------|-------------|-------------|
| id | integer | Activity ID | Always 0 |
| activityTypeName | string | Activity type | "Book/E-book" |
| typeName | string | Type name | "Book/E-book" |
| date | string | Publication date | ISO 8601 |
| title | string | Book title | min 1, max 100 |
| description | string | Description | max 1000 |
| url | string | Book URL | https:// |
| isPrivate | boolean | Private | - |
| targetAudience | array | Audiences | See Video section |
| tenant | string | Tenant | "MVP" |
| userProfileId | integer | Profile ID | Your ID |
| role | string | Role | Author, Co-Author |
| technologyFocusArea | string | Tech area | - |
| additionalTechnologyAreas | array | Additional | [] |
| numberOfViews | integer | Readers/downloads | minimum 0 |
| subscriberBase | integer | Subscribers | minimum 0 |
| copiesSold | integer | Copies sold | minimum 0 |
| imageUrl | string | Image | "" |

---

## All MVP Activity Types

```
"Blog"
"Book/E-book"
"Code Project/Sample"
"Conference (booth)"
"Conference (organizer)"
"Forum Moderator"
"Forum Participation (3rd Party Forums)"
"Forum Participation (Microsoft Forums)"
"Mentorship"
"Open Source Project(s)"
"Other"
"Product Group Feedback"
"Site Owner"
"Speaking (Conference)"
"Speaking (Local Event / User Group / Meetup)"
"Speaking (Microsoft Event)"
"Technical Social Media (Twitter, Facebook, LinkedIn...)"
"Translation Review, Feedback and Editing"
"Video"
"Workshop"
```

---

## MVP Target Audiences

```
"Developer"
"Technical Decision Maker"
"Business Decision Maker"
"Student"
"IT Pro"
"End User"
```

---

## Technology Focus Areas (Examples)

```
"Web Development"
"Cloud & AI"
"Developer Tools"
"Mobile Development"
"Data & Analytics"
"Security"
"DevOps"
"IoT"
"Machine Learning"
"Blockchain"
```

---

# Google GDE API (Advocu)

## Base URL
```
https://api.advocu.com/personal-api/v1/gde
```

## Authentication
```
Authorization: Bearer <token>
```

## Rate Limit
30 requests per minute

---

## POST /activity-drafts/content-creation

Creates a published content draft.

| Name            | Type    | Description                                | Restrictions                                                 |
| --------------- | ------- | ------------------------------------------ | ------------------------------------------------------------ |
| contentType     | string  | Content type                               | enum (8 values)                                              |
| title           | string  | What was the title?                        | min length 3, max length 200                                 |
| description     | string  | What was it about?                         | max length 2000                                              |
| tags            | array   | Tags                                       | enum (108 values), min items 0                               |
| metrics.readers | integer | How many people read your content?         | minimum 1                                                    |
| activityDate    | string  | Date published                             | pattern YYYY-MM-DD                                           |
| activityUrl     | string  | Link to Content                            | max length 500, pattern https?://([www.)?.*](http://www.)/?.*) |
| additionalInfo  | string  | Additional information                     | max length 2000                                              |
| private         | boolean | Do you want to make this activity private? | -                                                            |

------

## POST /activity-drafts/public-speaking

Records a talk, conference, or public presentation.

| Name              | Type    | Description                                     | Restrictions                                                 |
| ----------------- | ------- | ----------------------------------------------- | ------------------------------------------------------------ |
| title             | string  | What was the title of your talk?                | min length 3, max length 200                                 |
| description       | string  | What was it about?                              | max length 2000                                              |
| tags              | array   | Tags                                            | enum (108 values), min items 0                               |
| metrics.attendees | integer | How many people attended your session in total? | minimum 1                                                    |
| eventFormat       | string  | Select event format                             | enum (3 values)                                              |
| country           | string  | Country                                         | enum (251 values), if eventFormat is In-Person or Hybrid     |
| inPersonAttendees | integer | In-person attendees (if applicable)             | minimum 0, if eventFormat is Hybrid or In-Person             |
| activityDate      | string  | Date of your talk                               | pattern YYYY-MM-DD                                           |
| activityUrl       | string  | Event link or relevant URL                      | max length 500, pattern https?://([www.)?.*](http://www.)/?.*) |
| additionalInfo    | string  | Additional information                          | max length 2000                                              |
| private           | boolean | Do you want to make this activity private?      | -                                                            |

------

## POST /activity-drafts/workshop

Records a training workshop.

| Name              | Type    | Description                                 | Restrictions                                                 |
| ----------------- | ------- | ------------------------------------------- | ------------------------------------------------------------ |
| title             | string  | What was the name of your workshop session? | min length 3, max length 200                                 |
| description       | string  | What was it about?                          | max length 2000                                              |
| tags              | array   | Tags                                        | enum (108 values), min items 0                               |
| metrics.attendees | integer | How many people have been trained?          | minimum 1                                                    |
| eventFormat       | string  | Select event format                         | enum (3 values)                                              |
| country           | string  | Country                                     | enum (251 values), if eventFormat is In-Person or Hybrid     |
| inPersonAttendees | integer | In-person attendees (if applicable)         | minimum 0, if eventFormat is Hybrid or In-Person             |
| activityDate      | string  | Date of your workshop                       | pattern YYYY-MM-DD                                           |
| activityUrl       | string  | Workshop/event link                         | max length 500, pattern https?://([www.)?.*](http://www.)/?.*) |
| additionalInfo    | string  | Additional information                      | max length 2000                                              |
| private           | boolean | Do you want to make this activity private?  | -                                                            |

------

## POST /activity-drafts/mentoring

Records a mentoring session.

| Name              | Type    | Description                                  | Restrictions                                                 |
| ----------------- | ------- | -------------------------------------------- | ------------------------------------------------------------ |
| title             | string  | What was the name of your mentoring session? | min length 3, max length 200                                 |
| description       | string  | What was it about?                           | max length 2000                                              |
| tags              | array   | Tags                                         | enum (108 values), min items 0                               |
| metrics.attendees | integer | How many people have been mentored in total? | minimum 1                                                    |
| eventFormat       | string  | Select event format                          | enum (3 values)                                              |
| country           | string  | Country                                      | enum (251 values), if eventFormat is In-Person or Hybrid     |
| inPersonAttendees | integer | In-person attendees (if applicable)          | minimum 0, if eventFormat is Hybrid or In-Person             |
| activityDate      | string  | Date of your mentoring session               | pattern YYYY-MM-DD                                           |
| activityUrl       | string  | Event or relevant link                       | max length 500, pattern https?://([www.)?.*](http://www.)/?.*) |
| additionalInfo    | string  | Additional information                       | max length 2000                                              |
| private           | boolean | Do you want to make this activity private?   | -                                                            |

------

## POST /activity-drafts/product-feedback-given

Records product feedback.

| Name               | Type    | Description                                | Restrictions                   |
| ------------------ | ------- | ------------------------------------------ | ------------------------------ |
| title              | string  | Title                                      | min length 3, max length 200   |
| description        | string  | Description                                | max length 2000                |
| contentType        | string  | Content type                               | enum (2 values)                |
| productDescription | string  | What product was it about?                 | max length 500                 |
| tags               | array   | Tags                                       | enum (108 values), min items 0 |
| metrics.timeSpent  | integer | Time spent (in minutes)                    | minimum 1                      |
| activityDate       | string  | Participation Date                         | pattern YYYY-MM-DD             |
| additionalInfo     | string  | Additional information                     | max length 2000                |
| private            | boolean | Do you want to make this activity private? | -                              |

------

## POST /activity-drafts/interaction-with-googlers

Records a direct interaction with Google personnel.

| Name              | Type    | Description                                | Restrictions                   |
| ----------------- | ------- | ------------------------------------------ | ------------------------------ |
| title             | string  | Title                                      | min length 3, max length 200   |
| description       | string  | Description                                | max length 2000                |
| format            | string  | Format                                     | enum (8 values)                |
| interactionType   | string  | Interaction Type                           | enum (6 values)                |
| tags              | array   | Tags                                       | enum (108 values), min items 0 |
| metrics.timeSpent | integer | Time spent (in minutes)                    | minimum 1                      |
| activityDate      | string  | Interaction Date                           | pattern YYYY-MM-DD             |
| additionalInfo    | string  | Additional information                     | max length 2000                |
| additionalLinks   | string  | Additional links                           | max length 2000                |
| private           | boolean | Do you want to make this activity private? | -                              |

------

## POST /activity-drafts/storiesName

Records a story or significant experience.

| Name             | Type    | Description                                | Restrictions                                                 |
| ---------------- | ------- | ------------------------------------------ | ------------------------------------------------------------ |
| title            | string  | Title of the story                         | min length 3, max length 200                                 |
| description      | string  | Description                                | max length 2000                                              |
| whyIsSignificant | string  | Why is it significant                      | max length 2000                                              |
| significanceType | string  | Significance type                          | enum (6 values)                                              |
| activityUrl      | string  | Link                                       | max length 500, pattern https?://([www.)?.*](http://www.)/?.*) |
| tags             | array   | Tags                                       | enum (108 values), min items 0                               |
| metrics.impact   | integer | Impact (views, reads, attendees, etc.)     | minimum 1                                                    |
| additionalInfo   | string  | Additional information                     | max length 2000                                              |
| private          | boolean | Do you want to make this activity private? | -                                                            |